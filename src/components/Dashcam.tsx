'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { initializeModel, detectPotholes, captureFrame, dataUrlToBlob } from '@/lib/ai-model';
import { verifyWithWorldID, isWorldApp } from '@/lib/worldid';
import { PotholeReport } from '@/types/report';
import { cn } from '@/lib/utils';

export default function Dashcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [lastDetection, setLastDetection] = useState<Date | null>(null);
  const [detectionCount, setDetectionCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const detectionLoopRef = useRef<number | null>(null);

  // Initialize AI model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await initializeModel();
        setIsModelLoaded(true);
      } catch (err) {
        setError('Failed to load AI model. Please refresh the page.');
        console.error(err);
      }
    };
    loadModel();
  }, []);

  // Start camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions.');
      console.error(err);
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  };

  // Detection loop
  useEffect(() => {
    if (!isStreaming || !isModelLoaded || !isDetecting) return;

    const runDetection = async () => {
      if (!videoRef.current || !canvasRef.current) return;

      try {
        const detections = await detectPotholes(videoRef.current, 0.6);

        if (detections.length > 0) {
          const detection = detections[0]; // Take highest confidence
          
          // Draw bounding box
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d')!;
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 4;
          ctx.strokeRect(
            detection.boundingBox.x,
            detection.boundingBox.y,
            detection.boundingBox.width,
            detection.boundingBox.height
          );
          
          // Draw label
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(
            detection.boundingBox.x,
            detection.boundingBox.y - 30,
            200,
            30
          );
          ctx.fillStyle = '#ffffff';
          ctx.font = '20px sans-serif';
          ctx.fillText(
            `Pothole ${(detection.confidence * 100).toFixed(0)}%`,
            detection.boundingBox.x + 5,
            detection.boundingBox.y - 8
          );

          setLastDetection(new Date());
          setDetectionCount((prev) => prev + 1);
        } else {
          // Clear canvas if no detection
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d')!;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      } catch (err) {
        console.error('Detection error:', err);
      }

      // Continue loop
      detectionLoopRef.current = requestAnimationFrame(runDetection);
    };

    runDetection();

    return () => {
      if (detectionLoopRef.current) {
        cancelAnimationFrame(detectionLoopRef.current);
      }
    };
  }, [isStreaming, isModelLoaded, isDetecting]);

  // Handle report submission
  const handleReport = async () => {
    if (!videoRef.current || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });

      const { latitude, longitude } = position.coords;
      const timestamp = Date.now();

      // Capture frame
      const dataUrl = captureFrame(videoRef.current);
      const blob = dataUrlToBlob(dataUrl);

      // Verify with World ID (if in World App)
      let worldIdProof;
      let isVerified = false;
      
      if (isWorldApp()) {
        try {
          // Get proof from World ID
          const verifyData = await verifyWithWorldID(latitude, longitude, timestamp);
          
          // Verify proof on server
          const verifyResponse = await fetch('/api/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(verifyData),
          });
          
          const verifyResult = await verifyResponse.json();
          
          if (verifyResult.success) {
            worldIdProof = verifyData.payload;
            isVerified = true;
          } else {
            throw new Error(verifyResult.error || 'Verification failed on server');
          }
        } catch (err: any) {
          console.error('World ID verification failed:', err);
          // Continue without verification if user is not in World App
          // or if verification fails
          setError(`World ID verification failed: ${err.message}`);
        }
      }

      // Run detection one more time for the captured frame
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      const detections = await detectPotholes(img, 0.6);

      if (detections.length === 0) {
        throw new Error('No pothole detected in captured frame');
      }

      // Create report
      const report: PotholeReport = {
        id: `report-${timestamp}`,
        timestamp,
        location: { latitude, longitude },
        image: { dataUrl, blob },
        detection: {
          confidence: detections[0].confidence,
          boundingBox: detections[0].boundingBox,
        },
        worldId: worldIdProof,
        status: isVerified ? 'verified' : 'pending',
      };

      // Submit to backend
      const formData = new FormData();
      formData.append('report', JSON.stringify(report));
      formData.append('image', blob, `pothole-${timestamp}.jpg`);

      const response = await fetch('/api/reports', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit report');
      }

      alert('Report submitted successfully! 🎉');
      setDetectionCount(0);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white">
        <h1 className="text-2xl font-bold">🚧 Pothole Patrol</h1>
        <p className="text-sm opacity-90">AI-Powered Dashcam</p>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        />

        {/* Status Overlay */}
        <div className="absolute top-4 left-4 right-4 flex flex-col gap-2">
          {!isModelLoaded && (
            <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Loading AI Model...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {isDetecting && lastDetection && (
            <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">
                Pothole Detected! ({detectionCount} total)
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-3">
        {!isStreaming ? (
          <button
            onClick={startCamera}
            disabled={!isModelLoaded}
            className={cn(
              'w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2',
              isModelLoaded
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
          >
            <Camera className="w-6 h-6" />
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={() => setIsDetecting(!isDetecting)}
              className={cn(
                'w-full py-4 rounded-lg font-bold text-lg',
                isDetecting
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              )}
            >
              {isDetecting ? 'Stop Detection' : 'Start Detection'}
            </button>

            {detectionCount > 0 && (
              <button
                onClick={handleReport}
                disabled={isSubmitting}
                className={cn(
                  'w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2',
                  isSubmitting
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                )}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Report Pothole</>
                )}
              </button>
            )}

            <button
              onClick={stopCamera}
              className="w-full py-2 rounded-lg font-medium text-gray-400 hover:text-white"
            >
              Stop Camera
            </button>
          </>
        )}
      </div>
    </div>
  );
}
