'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, Loader2, Video } from 'lucide-react';
// import { initializeModel, detectPotholes, captureFrame, dataUrlToBlob } from '@/lib/ai-model';
import { verifyWithWorldID, isWorldApp } from '@/lib/worldid';
import { PotholeReport } from '@/types/report';
import { cn } from '@/lib/utils';

export default function Dashcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraInitializing, setCameraInitializing] = useState(false);

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  // Start camera stream
  const startCamera = async () => {
    setCameraInitializing(true);
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setCameraInitializing(false);
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions in your browser settings.');
      setCameraInitializing(false);
      console.error('Camera error:', err);
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

  // Capture frame from video
  const captureFrame = (): string => {
    if (!videoRef.current) return '';
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(videoRef.current, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  };

  // Convert data URL to Blob
  const dataUrlToBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

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

      // Capture frame from video
      const dataUrl = captureFrame();
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

      // Create report (AI detection will be added later)
      const report: PotholeReport = {
        id: `report-${timestamp}`,
        timestamp,
        location: { latitude, longitude },
        image: { dataUrl, blob },
        detection: {
          confidence: 1.0, // Placeholder - will be from AI model later
          boundingBox: {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
          },
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
      <div className="flex-1 relative overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Status Overlay */}
        <div className="absolute top-4 left-4 right-4 flex flex-col gap-2">
          {cameraInitializing && (
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Initializing camera...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {isStreaming && !error && (
            <div className="bg-green-500/90 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <Video className="w-5 h-5" />
              <span className="font-medium">Camera Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-3">
        {!isStreaming && !cameraInitializing ? (
          <button
            onClick={startCamera}
            className="w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Camera className="w-6 h-6" />
            Start Camera
          </button>
        ) : isStreaming ? (
          <>
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
                  Submitting Report...
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6" />
                  Capture & Report Pothole
                </>
              )}
            </button>

            <button
              onClick={stopCamera}
              className="w-full py-2 rounded-lg font-medium text-gray-400 hover:text-white"
            >
              Stop Camera
            </button>
          </>
        ) : (
          <div className="w-full py-4 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
