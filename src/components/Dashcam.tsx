'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, Loader2, Video, SwitchCamera, Wifi, Globe } from 'lucide-react';
import Hls from 'hls.js';
// import { initializeModel, detectPotholes, captureFrame, dataUrlToBlob } from '@/lib/ai-model';
import { verifyWithWorldID, isWorldApp } from '@/lib/worldid';
import { PotholeReport } from '@/types/report';
import { cn } from '@/lib/utils';

type CameraFacing = 'user' | 'environment';
type VideoSourceType = 'device' | 'network';

interface VideoSource {
  type: VideoSourceType;
  facingMode?: CameraFacing;
  url?: string;
  name?: string;
}

interface ConnectionStatus {
  dashcam: boolean;
  internet: boolean;
}

export default function Dashcam() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cameraInitializing, setCameraInitializing] = useState(false);
  const [videoSource, setVideoSource] = useState<VideoSource>({
    type: 'device',
    facingMode: 'environment'
  });
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [networkUrl, setNetworkUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    dashcam: false,
    internet: true
  });

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  // Check internet connectivity
  useEffect(() => {
    const checkInternet = async () => {
      try {
        await fetch('https://www.google.com/favicon.ico', { method: 'HEAD', mode: 'no-cors' });
        setConnectionStatus(prev => ({ ...prev, internet: true }));
      } catch {
        setConnectionStatus(prev => ({ ...prev, internet: false }));
      }
    };
    
    checkInternet();
    const interval = setInterval(checkInternet, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  // Start camera stream (device or network)
  const startCamera = async () => {
    setCameraInitializing(true);
    setError(null);
    
    try {
      if (videoSource.type === 'device') {
        // Phone camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: videoSource.facingMode,
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
          setCameraInitializing(false);
        }
      } else if (videoSource.type === 'network' && videoSource.url) {
        // Network dashcam
        await connectToNetworkCamera(videoSource.url);
      }
    } catch (err) {
      setError('Camera access denied. Please enable camera permissions in your browser settings.');
      setCameraInitializing(false);
      console.error('Camera error:', err);
    }
  };

  // Connect to network camera (WiFi dashcam)
  const connectToNetworkCamera = async (url: string) => {
    if (!videoRef.current) return;

    try {
      // Check if URL is HLS stream (.m3u8)
      if (url.includes('.m3u8') && Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsStreaming(true);
          setCameraInitializing(false);
          setConnectionStatus(prev => ({ ...prev, dashcam: true }));
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error('HLS error:', data);
          setError(`Network camera error: ${data.type}`);
          setCameraInitializing(false);
          setConnectionStatus(prev => ({ ...prev, dashcam: false }));
        });
        
        hlsRef.current = hls;
      } else {
        // Direct video URL (MJPEG, MP4, etc.)
        videoRef.current.src = url;
        videoRef.current.onloadedmetadata = () => {
          setIsStreaming(true);
          setCameraInitializing(false);
          setConnectionStatus(prev => ({ ...prev, dashcam: true }));
        };
        videoRef.current.onerror = () => {
          setError('Failed to connect to network camera');
          setCameraInitializing(false);
          setConnectionStatus(prev => ({ ...prev, dashcam: false }));
        };
      }
    } catch (err) {
      setError('Failed to connect to network camera');
      setCameraInitializing(false);
      console.error('Network camera error:', err);
    }
  };

  // Switch between front and back camera
  const switchCamera = async () => {
    if (videoSource.type !== 'device') return;
    
    const newFacingMode: CameraFacing = videoSource.facingMode === 'environment' ? 'user' : 'environment';
    setVideoSource({
      type: 'device',
      facingMode: newFacingMode
    });
    
    // Stop current stream
    stopCamera();
    
    // Start new stream with different camera
    setTimeout(() => startCamera(), 100);
  };

  // Stop camera stream
  const stopCamera = () => {
    // Stop device camera
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    
    // Stop HLS stream
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    
    // Clear video src
    if (videoRef.current) {
      videoRef.current.src = '';
    }
    
    setIsStreaming(false);
    setConnectionStatus(prev => ({ ...prev, dashcam: false }));
  };

  // Handle video source change
  const handleSourceChange = (type: VideoSourceType) => {
    stopCamera();
    
    if (type === 'device') {
      setVideoSource({ type: 'device', facingMode: 'environment' });
      setShowSourceSelector(false);
      setTimeout(() => startCamera(), 100);
    } else {
      setVideoSource({ type: 'network', url: '' });
      setShowSourceSelector(false);
    }
  };

  // Connect to network camera with URL
  const handleNetworkConnect = () => {
    if (!networkUrl.trim()) {
      setError('Please enter a valid camera URL');
      return;
    }
    
    setVideoSource({ type: 'network', url: networkUrl });
    setTimeout(() => startCamera(), 100);
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

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {/* Source Selector Button */}
          <button
            onClick={() => setShowSourceSelector(!showSourceSelector)}
            className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Select video source"
          >
            <Camera className="w-6 h-6" />
          </button>
          
          {/* Switch Camera Button (only for device cameras) */}
          {isStreaming && videoSource.type === 'device' && (
            <button
              onClick={switchCamera}
              disabled={cameraInitializing}
              className="bg-black/50 backdrop-blur-sm text-white p-3 rounded-full hover:bg-black/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Switch camera"
            >
              <SwitchCamera className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Status Overlay */}
        <div className="absolute top-4 left-4 right-16 flex flex-col gap-2">
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
              {videoSource.type === 'device' ? (
                <>
                  <Video className="w-5 h-5" />
                  <span className="font-medium">
                    {videoSource.facingMode === 'environment' ? 'Back Camera' : 'Front Camera'}
                  </span>
                </>
              ) : (
                <>
                  <Wifi className="w-5 h-5" />
                  <span className="font-medium">WiFi Dashcam</span>
                </>
              )}
            </div>
          )}
          
          {/* Connection Status */}
          {videoSource.type === 'network' && (
            <div className="flex gap-2">
              <div className={cn(
                "px-3 py-1 rounded-lg text-xs flex items-center gap-1",
                connectionStatus.dashcam ? "bg-green-500/90 text-white" : "bg-gray-500/90 text-white"
              )}>
                <Wifi className="w-4 h-4" />
                {connectionStatus.dashcam ? 'Connected' : 'Disconnected'}
              </div>
              <div className={cn(
                "px-3 py-1 rounded-lg text-xs flex items-center gap-1",
                connectionStatus.internet ? "bg-green-500/90 text-white" : "bg-yellow-500/90 text-black"
              )}>
                <Globe className="w-4 h-4" />
                {connectionStatus.internet ? 'Online' : 'Offline'}
              </div>
            </div>
          )}
        </div>
        
        {/* Source Selector Modal */}
        {showSourceSelector && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-20 p-4">
            <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full space-y-4">
              <h3 className="text-xl font-bold text-white">Select Video Source</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleSourceChange('device')}
                  className="w-full p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-3 transition-colors"
                >
                  <Camera className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-bold">Phone Camera</div>
                    <div className="text-sm opacity-80">Use your phone's camera</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleSourceChange('network')}
                  className="w-full p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-3 transition-colors"
                >
                  <Wifi className="w-6 h-6" />
                  <div className="text-left">
                    <div className="font-bold">WiFi Dashcam</div>
                    <div className="text-sm opacity-80">Connect to network camera</div>
                  </div>
                </button>
              </div>
              
              {videoSource.type === 'network' && (
                <div className="space-y-3 pt-3 border-t border-gray-700">
                  <input
                    type="text"
                    value={networkUrl}
                    onChange={(e) => setNetworkUrl(e.target.value)}
                    placeholder="http://192.168.1.1:8080/video.m3u8"
                    className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>• HLS streams (.m3u8)</div>
                    <div>• MJPEG streams</div>
                    <div>• Direct video URLs</div>
                  </div>
                  <button
                    onClick={handleNetworkConnect}
                    disabled={!networkUrl.trim()}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-colors"
                  >
                    Connect
                  </button>
                </div>
              )}
              
              <button
                onClick={() => setShowSourceSelector(false)}
                className="w-full py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 space-y-3">
        {!isStreaming && !cameraInitializing ? (
          <button
            onClick={() => startCamera()}
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
