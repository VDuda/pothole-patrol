import * as ort from 'onnxruntime-web';

export interface Detection {
  confidence: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  class: string;
}

let session: ort.InferenceSession | null = null;

/**
 * Initialize the YOLO model
 * @param modelPath - Path to the ONNX model file
 */
export async function initializeModel(
  modelPath: string = '/models/pothole.onnx'
): Promise<void> {
  if (session) {
    console.log('YOLO model already loaded');
    return;
  }

  try {
    // Configure ONNX Runtime for WASM
    // Use the latest compatible version
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
    ort.env.logLevel = 'error'; // Suppress non-critical logs (like CPU vendor warnings)
    
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
    
    console.log('YOLO model loaded successfully');
  } catch (error) {
    console.error('Failed to load YOLO model. Please ensure /public/models/pothole.onnx exists.', error);
    // We do not re-throw here to allow the app to continue (e.g. in manual mode)
    // But we set session to null so detectPotholes knows it's not ready
    session = null;
  }
}

export function isModelLoaded(): boolean {
  return session !== null;
}

let preprocessCanvas: HTMLCanvasElement | null = null;
let preprocessCtx: CanvasRenderingContext2D | null = null;

/**
 * Preprocess image for YOLO inference
 * @param imageElement - HTML Image or Video element
 * @param targetSize - Model input size (default 640x640)
 * @returns Preprocessed tensor
 */
function preprocessImage(
  imageElement: HTMLImageElement | HTMLVideoElement,
  targetSize: number = 640
): ort.Tensor {
  // Create or reuse canvas for preprocessing
  if (!preprocessCanvas || preprocessCanvas.width !== targetSize || preprocessCanvas.height !== targetSize) {
    preprocessCanvas = document.createElement('canvas');
    preprocessCanvas.width = targetSize;
    preprocessCanvas.height = targetSize;
    preprocessCtx = preprocessCanvas.getContext('2d', { willReadFrequently: true });
  }

  if (!preprocessCtx) throw new Error('Failed to get 2d context');
  
  // Draw and resize image
  preprocessCtx.drawImage(imageElement, 0, 0, targetSize, targetSize);
  
  // Get image data
  const imageData = preprocessCtx.getImageData(0, 0, targetSize, targetSize);
  const pixels = imageData.data;
  
  // Convert to RGB and normalize (0-255 -> 0-1)
  const red: number[] = [];
  const green: number[] = [];
  const blue: number[] = [];
  
  for (let i = 0; i < pixels.length; i += 4) {
    red.push(pixels[i] / 255.0);
    green.push(pixels[i + 1] / 255.0);
    blue.push(pixels[i + 2] / 255.0);
  }
  
  // Concatenate channels (CHW format)
  const input = Float32Array.from([...red, ...green, ...blue]);
  
  // Create tensor
  return new ort.Tensor('float32', input, [1, 3, targetSize, targetSize]);
}

/**
 * Post-process YOLO output
 * @param output - Raw model output tensor
 * @param confidenceThreshold - Minimum confidence threshold
 * @returns Array of detections
 */
function postprocessOutput(
  output: ort.Tensor,
  confidenceThreshold: number = 0.6
): Detection[] {
  const detections: Detection[] = [];
  const data = output.data as Float32Array;
  
  // YOLOv8 output format: [batch, channels, anchors]
  // channels = 4 (bbox) + num_classes
  const dims = output.dims; // e.g., [1, 84, 8400] or [1, 5, 8400]
  const numChannels = dims[1];
  const numAnchors = dims[2];
  const numClasses = numChannels - 4;
  
  for (let i = 0; i < numAnchors; i++) {
    // Find class with max score
    let maxScore = 0;
    let maxClass = 0;
    
    // The first 4 rows are bbox (cx, cy, w, h)
    // The rest are classes
    for (let c = 0; c < numClasses; c++) {
      const score = data[(4 + c) * numAnchors + i]; // data is likely flattened in a specific way, usually row-major or col-major? 
      // ONNX Runtime JS usually gives row-major [batch, channel, anchor]
      // Index = b * (channels * anchors) + c * (anchors) + i
      // We assume batch=0.
      if (score > maxScore) {
        maxScore = score;
        maxClass = c;
      }
    }
    
    // Filter by confidence
    if (maxScore >= confidenceThreshold) {
      // Get bounding box (center_x, center_y, width, height)
      const cx = data[0 * numAnchors + i];
      const cy = data[1 * numAnchors + i];
      const w = data[2 * numAnchors + i];
      const h = data[3 * numAnchors + i];
      
      // Convert to corner format
      const x = cx - w / 2;
      const y = cy - h / 2;
      
      detections.push({
        confidence: maxScore,
        boundingBox: { x, y, width: w, height: h },
        class: numClasses === 1 ? 'pothole' : (maxClass === 0 ? 'pothole' : 'unknown'), // Logic: If only 1 class, it's a pothole. If 80 classes, class 0 is person (often misidentified as pothole? No, we should probably stick to specific classes if using generic model, but for now let's say class 0 is interesting)
      });
    }
  }
  
  return detections;
}

/**
 * Run inference on an image
 * @param imageElement - HTML Image or Video element
 * @param confidenceThreshold - Minimum confidence threshold
 * @returns Array of detections
 */
export async function detectPotholes(
  imageElement: HTMLImageElement | HTMLVideoElement,
  confidenceThreshold: number = 0.25
): Promise<Detection[]> {
  if (!session) {
    console.warn('Model not initialized (session is null)');
    throw new Error('Model not initialized. Call initializeModel() first.');
  }
  
  try {
    // Preprocess
    const inputTensor = preprocessImage(imageElement);
    
    // Run inference
    const feeds: Record<string, ort.Tensor> = {};
    const inputName = session.inputNames[0];
    feeds[inputName] = inputTensor;
    
    // console.time('inference');
    const results = await session.run(feeds);
    // console.timeEnd('inference');
    
    // Get output tensor
    const output = results[Object.keys(results)[0]];
    
    // Post-process
    const detections = postprocessOutput(output, confidenceThreshold);
    
    return detections;
  } catch (error) {
    console.error('Inference error:', error);
    throw error;
  }
}

/**
 * Capture a frame from video element as data URL
 * @param videoElement - HTML Video element
 * @returns Data URL of the captured frame
 */
export function captureFrame(videoElement: HTMLVideoElement): string {
  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(videoElement, 0, 0);
  return canvas.toDataURL('image/jpeg', 0.9);
}

/**
 * Convert data URL to Blob
 * @param dataUrl - Data URL string
 * @returns Blob object
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)![1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
