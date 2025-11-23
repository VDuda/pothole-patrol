'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, AlertCircle, Loader2, Video, SwitchCamera, Wifi, Globe, MapPin, X, Check, Activity } from 'lucide-react';
import Hls from 'hls.js';
import { verifyWithWorldID, isWorldApp } from '@/lib/worldid';
import { initializeModel, detectPotholes, captureFrame, dataUrlToBlob } from '@/lib/ai-model';
import { PotholeReport } from '@/types/report';
import { cn } from '@/lib/utils';
import { ethers } from 'ethers';

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
  
  // Camera State
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
  const [modelReady, setModelReady] = useState(false);

  // Patrol State
  const [isPatrolling, setIsPatrolling] = useState(false);
  const [sessionReports, setSessionReports] = useState<PotholeReport[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Auto-start camera and load model when component mounts
  useEffect(() => {
    startCamera();
    
    // Initialize AI Model
    const loadModel = async () => {
      try {
        await initializeModel();
        setModelReady(true);
        console.log('AI Model loaded');
      } catch (err) {
        console.error('Failed to load AI model:', err);
        // We don't block the app, but AI features won't work
      }
    };
    loadModel();
    
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  // AI Detection Loop
  useEffect(() => {
    let detectionInterval: NodeJS.Timeout;

    const runDetection = async () => {
      if (!isPatrolling || !videoRef.current || !modelReady || !isStreaming) return;

      try {
        const detections = await detectPotholes(videoRef.current);
        
        if (detections.length > 0) {
          // Found a pothole!
          // We only take the highest confidence one for now to avoid spam
          const bestDetection = detections.reduce((prev, current) => 
            (prev.confidence > current.confidence) ? prev : current
          );

          // Get location
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 2000,
            });
          }).catch(() => null);

          if (position) {
            const { latitude, longitude } = position.coords;
            const timestamp = Date.now();
            const dataUrl = captureFrame(videoRef.current);
            const blob = dataUrlToBlob(dataUrl);

            const newReport: PotholeReport = {
              id: `report-${timestamp}`,
              timestamp,
              location: { latitude, longitude },
              image: { dataUrl, blob },
              detection: bestDetection,
              status: 'pending',
            };

            setSessionReports(prev => {
              // Simple de-bouncing: don't add if we just added one < 2 seconds ago
              const lastReport = prev[prev.length - 1];
              if (lastReport && (timestamp - lastReport.timestamp < 2000)) {
                return prev;
              }
              return [...prev, newReport];
            });
          }
        }
      } catch (err) {
        console.error('Detection loop error:', err);
      }
    };

    if (isPatrolling && modelReady) {
      // Run detection every 500ms
      detectionInterval = setInterval(runDetection, 500);
    }

    return () => clearInterval(detectionInterval);
  }, [isPatrolling, modelReady, isStreaming]);

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

  // Start Patrol
  const startPatrol = () => {
    setIsPatrolling(true);
    setSessionReports([]);
    setStartTime(Date.now());
    setShowSummary(false);
  };

  // Stop Patrol
  const stopPatrol = () => {
    setIsPatrolling(false);
    if (sessionReports.length > 0) {
      setShowSummary(true);
    }
  };

  // Simulate AI detection (Manual trigger for now)
  const handleSimulateDetection = async () => {
    if (!videoRef.current) return;

    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
        });
      });

      const { latitude, longitude } = position.coords;
      const timestamp = Date.now();

      // Capture frame
      const dataUrl = captureFrame(videoRef.current!);
      const blob = dataUrlToBlob(dataUrl);

      // Create pending report
      const newReport: PotholeReport = {
        id: `report-${timestamp}`,
        timestamp,
        location: { latitude, longitude },
        image: { dataUrl, blob },
        detection: {
          confidence: 0.85 + Math.random() * 0.14, // Simulated confidence
          boundingBox: {
            x: 100,
            y: 100,
            width: 200,
            height: 200,
          },
        },
        status: 'pending',
      };

      setSessionReports(prev => [...prev, newReport]);
      
    } catch (err) {
      console.error('Detection error:', err);
    }
  };

  // Batch Verify & Submit
  const handleBatchSubmit = async () => {
    setIsSubmittingBatch(true);
    setError(null);

    try {
      let worldIdProof;
      let isVerified = false;

      // 1. Verify Session with World ID (if in World App)
      if (isWorldApp() && startTime) {
        try {
          // Create a session signal: hash(startTime + count + firstLocation)
          const firstLoc = sessionReports[0].location;
          const sessionString = `${startTime}-${sessionReports.length}-${firstLoc.latitude.toFixed(4)}`;
          const sessionSignal = ethers.id(sessionString);

          // Get one proof for the entire batch
          const verifyData = await verifyWithWorldID(undefined, undefined, undefined, sessionSignal);
          
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
          setError(`Verification failed: ${err.message}`);
          setIsSubmittingBatch(false);
          return;
        }
      }

      // 2. Submit all reports
      let uploadedCount = 0;
      
      for (const report of sessionReports) {
        const formData = new FormData();
        
        // Attach the session proof to each report
        const reportWithProof = {
          ...report,
          worldId: worldIdProof,
          status: isVerified ? 'verified' : 'pending',
          session: {
            id: startTime,
            index: uploadedCount + 1,
            total: sessionReports.length
          }
        };

        formData.append('report', JSON.stringify(reportWithProof));
        if (report.image.blob) {
          formData.append('image', report.image.blob, `pothole-${report.timestamp}.jpg`);
        }

        const response = await fetch('/api/reports', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          uploadedCount++;
        }
      }

      if (uploadedCount === sessionReports.length) {
        alert(`Successfully verified and uploaded ${uploadedCount} reports! 🎉`);
        setSessionReports([]);
        setShowSummary(false);
      } else {
        alert(`Uploaded ${uploadedCount}/${sessionReports.length} reports. Some failed.`);
      }

    } catch (err: any) {
      setError(err.message || 'Failed to submit batch');
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard these reports?')) {
      setSessionReports([]);
      setShowSummary(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-asphalt text-white relative overflow-hidden">
      {/* Header */}
      <div className="bg-concrete border-b border-white/5 p-4 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-safety-yellow rounded-md flex items-center justify-center text-asphalt">
             <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-sans tracking-tight">Pothole Patrol</h1>
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">AI Dashcam v1.0</p>
          </div>
        </div>
        {isPatrolling && (
          <div className="flex items-center gap-2 bg-alert-red/20 border border-alert-red/50 px-3 py-1.5 rounded-full animate-pulse">
            <div className="w-2 h-2 bg-alert-red rounded-full shadow-[0_0_8px_rgba(255,61,0,0.8)]" />
            <span className="text-[10px] font-bold text-alert-red uppercase tracking-wider">REC</span>
          </div>
        )}
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden bg-black" onClick={isPatrolling ? handleSimulateDetection : undefined}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Source Selector & Switch Camera */}
        <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
          <button
            onClick={() => setShowSourceSelector(!showSourceSelector)}
            className="bg-black/40 backdrop-blur-md text-white p-3.5 rounded-full hover:bg-black/60 active:scale-95 transition-all border border-white/10"
          >
            <Camera className="w-6 h-6" />
          </button>
          
          {isStreaming && videoSource.type === 'device' && (
            <button
              onClick={switchCamera}
              disabled={cameraInitializing}
              className="bg-black/40 backdrop-blur-md text-white p-3.5 rounded-full hover:bg-black/60 active:scale-95 transition-all border border-white/10"
            >
              <SwitchCamera className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Info Overlay */}
        <div className="absolute top-4 left-4 right-20 flex flex-col gap-2 pointer-events-none">
           {/* Patrolling Stats */}
           {isPatrolling && (
            <div className="bg-asphalt/80 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-white/10 shadow-lg w-fit">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">Session Potholes</div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-safety-yellow" />
                <span className="text-3xl font-bold font-mono tracking-tighter">{sessionReports.length}</span>
              </div>
            </div>
          )}

          {cameraInitializing && (
            <div className="bg-blue-600/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2 w-fit">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-xs font-medium font-mono">INIT_CAMERA...</span>
            </div>
          )}
          
          {error && (
            <div className="bg-alert-red/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg flex items-start gap-3 border border-white/10">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-xs font-medium leading-relaxed">{error}</span>
            </div>
          )}
        </div>

        {/* Tap to Detect Hint */}
        {isPatrolling && sessionReports.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-asphalt/60 px-6 py-3 rounded-full text-white/90 text-sm font-medium backdrop-blur-md border border-white/10 animate-pulse">
              Tap screen to simulate detection
            </div>
          </div>
        )}
      </div>

      {/* Main Controls */}
      <div className="bg-concrete p-6 pb-8 border-t border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.4)]">
        {!isStreaming && !cameraInitializing ? (
          <button
            onClick={() => startCamera()}
            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 bg-safety-yellow text-asphalt active:scale-[0.98] transition-transform shadow-lg shadow-safety-yellow/20"
          >
            <Camera className="w-6 h-6" />
            ENABLE CAMERA
          </button>
        ) : isPatrolling ? (
          <div className="flex gap-3">
             <button
              onClick={handleSimulateDetection}
              className="flex-1 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 bg-asphalt text-safety-yellow border border-safety-yellow/30 active:scale-[0.98] transition-transform"
            >
              <AlertCircle className="w-5 h-5" />
              MARK (+1)
            </button>
            <button
              onClick={stopPatrol}
              className="flex-[2] py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 bg-alert-red text-white active:scale-[0.98] transition-transform shadow-lg shadow-alert-red/20"
            >
              <div className="w-3 h-3 bg-white rounded-sm" />
              STOP PATROL
            </button>
          </div>
        ) : (
          <button
            onClick={startPatrol}
            className="w-full py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-3 bg-safety-yellow text-asphalt active:scale-[0.98] transition-transform shadow-lg shadow-safety-yellow/20"
          >
            <div className="w-3 h-3 bg-alert-red rounded-full animate-pulse" />
            START PATROL
          </button>
        )}
      </div>

      {/* Trip Summary Modal */}
      {showSummary && (
        <div className="absolute inset-0 z-50 bg-asphalt/95 backdrop-blur-xl flex flex-col p-6 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8">
            <div className="relative">
              <div className="absolute inset-0 bg-safety-yellow/20 blur-2xl rounded-full" />
              <div className="w-24 h-24 bg-gradient-to-br from-safety-yellow to-yellow-600 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                <Check className="w-12 h-12 text-asphalt" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-white font-sans">Patrol Complete</h2>
              <p className="text-gray-400 max-w-[200px] mx-auto leading-relaxed">Great job! Here are your session stats.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <div className="bg-concrete p-5 rounded-2xl border border-white/5">
                <div className="text-4xl font-bold text-safety-yellow mb-1 font-mono tracking-tighter">{sessionReports.length}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Potholes</div>
              </div>
              <div className="bg-concrete p-5 rounded-2xl border border-white/5">
                <div className="text-4xl font-bold text-white mb-1 font-mono tracking-tighter">
                  {startTime ? Math.round((Date.now() - startTime) / 1000 / 60) : 0}
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Minutes</div>
              </div>
            </div>

            <div className="w-full max-w-sm bg-concrete/50 border border-white/5 p-4 rounded-xl flex items-start gap-4 text-left">
              <div className="p-2 bg-asphalt rounded-lg border border-white/10 shrink-0">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-gray-300">
                <span className="font-bold text-white block mb-1">Verify once, sign all.</span>
                Use World ID to sign all {sessionReports.length} reports in a single batch.
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-3">
            <button
              onClick={handleBatchSubmit}
              disabled={isSubmittingBatch}
              className="w-full py-4 rounded-xl font-bold text-lg bg-white text-asphalt hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.99] transition-transform"
            >
              {isSubmittingBatch ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  VERIFYING...
                </>
              ) : (
                <>
                  VERIFY & UPLOAD BATCH
                </>
              )}
            </button>
            
            <button
              onClick={handleDiscard}
              disabled={isSubmittingBatch}
              className="w-full py-4 rounded-xl font-bold text-sm text-gray-500 hover:text-white transition-colors"
            >
              DISCARD REPORTS
            </button>
          </div>
        </div>
      )}

      {/* Source Selector Modal */}
      {showSourceSelector && (
         <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-concrete rounded-2xl p-6 max-w-md w-full space-y-6 border border-white/10 shadow-2xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Video Source</h3>
                <button onClick={() => setShowSourceSelector(false)} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => handleSourceChange('device')}
                  className="w-full p-4 bg-asphalt hover:bg-black text-white rounded-xl flex items-center gap-4 transition-all border border-white/5 hover:border-safety-yellow/50 group"
                >
                  <div className="p-3 bg-concrete rounded-full text-gray-400 group-hover:text-safety-yellow group-hover:bg-safety-yellow/10 transition-colors">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold group-hover:text-safety-yellow transition-colors">Phone Camera</div>
                    <div className="text-xs text-gray-500">Integrated device camera</div>
                  </div>
                </button>
                
                <button
                  onClick={() => handleSourceChange('network')}
                  className="w-full p-4 bg-asphalt hover:bg-black text-white rounded-xl flex items-center gap-4 transition-all border border-white/5 hover:border-safety-yellow/50 group"
                >
                  <div className="p-3 bg-concrete rounded-full text-gray-400 group-hover:text-safety-yellow group-hover:bg-safety-yellow/10 transition-colors">
                    <Wifi className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold group-hover:text-safety-yellow transition-colors">WiFi Dashcam</div>
                    <div className="text-xs text-gray-500">External network stream</div>
                  </div>
                </button>
              </div>
              
              {videoSource.type === 'network' && (
                <div className="space-y-3 pt-4 border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Stream URL</label>
                  <input
                    type="text"
                    value={networkUrl}
                    onChange={(e) => setNetworkUrl(e.target.value)}
                    placeholder="http://192.168.1.1:8080/video.m3u8"
                    className="w-full px-4 py-3 bg-asphalt text-white rounded-xl border border-white/10 focus:border-safety-yellow focus:outline-none font-mono text-sm"
                  />
                  <button
                    onClick={handleNetworkConnect}
                    disabled={!networkUrl.trim()}
                    className="w-full py-3 bg-safety-yellow hover:bg-yellow-400 disabled:bg-gray-700 disabled:text-gray-500 text-asphalt rounded-xl font-bold transition-colors shadow-lg shadow-safety-yellow/10"
                  >
                    CONNECT STREAM
                  </button>
                </div>
              )}
            </div>
          </div>
      )}
    </div>
  );
}