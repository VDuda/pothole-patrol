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
  try {
    // Configure ONNX Runtime for WASM
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.23.2/dist/';
    
    session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all',
    });
    
    console.log('YOLO model loaded successfully');
  } catch (error) {
    console.error('Failed to load YOLO model:', error);
    throw error;
  }
}

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
  // Create canvas for preprocessing
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext('2d')!;
  
  // Draw and resize image
  ctx.drawImage(imageElement, 0, 0, targetSize, targetSize);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, targetSize, targetSize);
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
  
  // YOLOv8 output format: [batch, 84, 8400]
  // 84 = 4 (bbox) + 80 (classes)
  const numDetections = 8400;
  
  for (let i = 0; i < numDetections; i++) {
    // Get confidence (max class score)
    let maxScore = 0;
    let maxClass = 0;
    
    for (let c = 0; c < 80; c++) {
      const score = data[i + (4 + c) * numDetections];
      if (score > maxScore) {
        maxScore = score;
        maxClass = c;
      }
    }
    
    // Filter by confidence
    if (maxScore >= confidenceThreshold) {
      // Get bounding box (center_x, center_y, width, height)
      const cx = data[i];
      const cy = data[i + numDetections];
      const w = data[i + 2 * numDetections];
      const h = data[i + 3 * numDetections];
      
      // Convert to corner format
      const x = cx - w / 2;
      const y = cy - h / 2;
      
      detections.push({
        confidence: maxScore,
        boundingBox: { x, y, width: w, height: h },
        class: maxClass === 0 ? 'pothole' : 'unknown',
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
  confidenceThreshold: number = 0.6
): Promise<Detection[]> {
  if (!session) {
    throw new Error('Model not initialized. Call initializeModel() first.');
  }
  
  try {
    // Preprocess
    const inputTensor = preprocessImage(imageElement);
    
    // Run inference
    const feeds = { images: inputTensor };
    const results = await session.run(feeds);
    
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
