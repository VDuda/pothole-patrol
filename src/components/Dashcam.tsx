'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, AlertCircle, Loader2, Video, SwitchCamera, Wifi, Globe, MapPin, X, Check, Activity, Settings, RefreshCw, Clock, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Hls from 'hls.js';
import { verifyWithWorldID, isWorldApp } from '@/lib/worldid';
import { initializeModel, detectPotholes, captureFrame, dataUrlToBlob, type Detection } from '@/lib/ai-model';
import { uploadSessionFolder, getIPFSUrl } from '@/lib/filecoin';
import { sessionStore, type PatrolSession } from '@/lib/session-store';
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
  const containerRef = useRef<HTMLDivElement>(null); // New ref for alignment
  const hlsRef = useRef<Hls | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Camera State
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraInitializing, setCameraInitializing] = useState(false);
  const [videoSource, setVideoSource] = useState<VideoSource>({
    type: 'device',
    facingMode: 'environment'
  });
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [networkUrl, setNetworkUrl] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    dashcam: false,
    internet: true
  });
  const [modelReady, setModelReady] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.25);
  const [showHistory, setShowHistory] = useState(false);
  const [patrolHistory, setPatrolHistory] = useState<PatrolSession[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [uploadStatus, setUploadStatus] = useState('');
  const [manualBox, setManualBox] = useState<{x: number, y: number} | null>(null);

  // Patrol State
  const [isPatrolling, setIsPatrolling] = useState(false);
  const isPatrollingRef = useRef(false);

  // Sync ref for detection loop
  useEffect(() => {
    isPatrollingRef.current = isPatrolling;
  }, [isPatrolling]);
  
  const [sessionReports, setSessionReports] = useState<PotholeReport[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  // Initial Model Load
  useEffect(() => {
    loadModel();
    return () => stopCamera();
  }, []);

  const loadModel = async () => {
    setModelReady(false);
    try {
      await initializeModel();
      setModelReady(true);
      console.log('AI Model loaded');
    } catch (err) {
      console.error('Failed to load AI model:', err);
      setError('Failed to load AI model');
    }
  };

  const testModelWithSample = async () => {
    try {
        const img = new Image();
        img.src = '/dashresult.jpeg';
        img.onload = async () => {
            console.log('Running test inference on sample image...');
            const results = await detectPotholes(img as any, 0.1); // Low threshold for test
            console.log('Test results:', results);
            alert(`Diagnostics:\nModel Loaded: ${modelReady}\nDetections on Sample: ${results.length}\nConfidence: ${results[0]?.confidence.toFixed(2) || 'N/A'}`);
        };
    } catch (e: any) {
        alert(`Test failed: ${e.message}`);
    }
  };

  // Optimized Detection Loop
  const runDetectionLoop = useCallback(async () => {
    if (!isPatrollingRef.current || !videoRef.current || !modelReady || !isStreaming) {
      // If stopped, clear loop
      if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
      return;
    }

    try {
      // Debug log to confirm loop is alive
      // console.log('running detection loop...'); 

      // Run inference
      const currentDetections = await detectPotholes(videoRef.current, confidenceThreshold);
      
      // Check if stopped while inferencing
      if (!isPatrollingRef.current) return;

      if (currentDetections.length > 0) {
        console.log(`🎯 AI Detected ${currentDetections.length} objects!`, currentDetections[0]);
      }

      setDetections(currentDetections);
      
      // Logging Logic (same as before but in this loop)
      if (currentDetections.length > 0) {
        const bestDetection = currentDetections.reduce((prev, current) => 
          (prev.confidence > current.confidence) ? prev : current
        );

        // Basic timestamp check to see if we should even attempt to log
        const now = Date.now();
        
        // Get location
        let position: { coords: { latitude: number; longitude: number } } | null = null;
        try {
            position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 2000,
                });
            });
        } catch (e) {
            console.warn('Geolocation failed, using fallback demo coordinates', e);
            // Fallback to Buenos Aires coordinates for demo purposes
            position = {
                coords: {
                    latitude: -34.590706 + (Math.random() * 0.001 - 0.0005), // Add slight jitter
                    longitude: -58.395948 + (Math.random() * 0.001 - 0.0005)
                }
            };
        }
        
        // Check if stopped while getting location
        if (!isPatrollingRef.current) return;

        if (position) {
            const { latitude, longitude } = position.coords;
            const dataUrl = captureFrame(videoRef.current!);
            const blob = dataUrlToBlob(dataUrl);

            const newReport: PotholeReport = {
                id: `report-${now}`,
                timestamp: now,
                location: { latitude, longitude },
                image: { dataUrl, blob },
                detection: bestDetection,
                status: 'pending',
            };

            setSessionReports(prev => {
                const lastReport = prev[prev.length - 1];
                if (lastReport && (now - lastReport.timestamp < 2000)) {
                    return prev;
                }
                return [...prev, newReport];
            });
        }
      }
    } catch (err) {
      console.error('Detection error:', err);
    }

    // Schedule next loop with delay (500ms) to prevent UI freeze
    if (isPatrollingRef.current) {
      animationFrameRef.current = window.setTimeout(runDetectionLoop, 500);
    }
  }, [isPatrolling, modelReady, isStreaming, confidenceThreshold]);

  // Secret Manual Capture
  const handleManualClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPatrolling || !videoRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Show feedback box
    setManualBox({ x, y });
    setTimeout(() => setManualBox(null), 500);

    // Capture logic
    try {
        const now = Date.now();
        const dataUrl = captureFrame(videoRef.current);
        const blob = dataUrlToBlob(dataUrl);
        
        // Get location (fast fallback if needed)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                addReport(now, latitude, longitude, dataUrl, blob);
            },
            () => {
                // Fallback coordinates
                 addReport(now, -34.590706, -58.395948, dataUrl, blob);
            },
            { timeout: 1000 }
        );
    } catch (err) {
        console.error('Manual capture failed', err);
    }
  };

  const addReport = (timestamp: number, latitude: number, longitude: number, dataUrl: string, blob: Blob) => {
     const newReport: PotholeReport = {
        id: `report-manual-${timestamp}`,
        timestamp,
        location: { latitude, longitude },
        image: { dataUrl, blob },
        detection: {
          confidence: 1.0, // Manual = 100% confidence
          boundingBox: { x: 0, y: 0, width: 0, height: 0 }, // No real bbox for manual
        },
        status: 'pending',
    };
    setSessionReports(prev => [...prev, newReport]);
  };

  // Start/Stop Loop Effect
  useEffect(() => {
    if (isPatrolling && modelReady && isStreaming) {
      runDetectionLoop();
    } else {
      if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
      setDetections([]);
    }
    return () => {
      if (animationFrameRef.current) clearTimeout(animationFrameRef.current);
    };
  }, [isPatrolling, modelReady, isStreaming, runDetectionLoop]);


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
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: videoSource.facingMode,
            width: { ideal: 1280 }, // Slightly lower for mobile perf
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsStreaming(true);
          setCameraInitializing(false);
        }
      } else if (videoSource.type === 'network' && videoSource.url) {
        await connectToNetworkCamera(videoSource.url);
      }
    } catch (err) {
      setError('Camera access denied.');
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
    console.log('Stopping patrol. Session count:', sessionReports.length);
    setIsPatrolling(false);
    
    try {
        if (startTime) {
            // Save session to local history (even if empty)
            sessionStore.saveSession(sessionReports, startTime);
        } else {
            console.error('Stop Patrol called but startTime is null?');
        }
    } catch (e) {
        console.error('Failed to save session:', e);
    } finally {
        // Always show summary even if save fails
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
      setUploadStatus('VERIFYING...');

      // 1. Verify Session with World ID (if in World App)
      if (isWorldApp() && startTime) {
        try {
          const firstLoc = sessionReports[0].location;
          const sessionString = `${startTime}-${sessionReports.length}-${firstLoc.latitude.toFixed(4)}`;
          const sessionSignal = ethers.id(sessionString);

          const verifyData = await verifyWithWorldID(undefined, undefined, undefined, sessionSignal);
          
          const verifyResponse = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

      // 2. Upload Session to Filecoin (Lighthouse)
      let folderCid = '';
      setUploadStatus('ARCHIVING TO FILECOIN...');
      try {
        const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
        if (!apiKey) throw new Error('Lighthouse API key missing');

        // Prepare files for folder upload
        const filesToUpload = sessionReports.map((report, index) => {
            // Recreate file from blob
            return new File([report.image.blob!], `pothole-${report.timestamp}.jpg`, { type: 'image/jpeg' });
        });

        // Add metadata file
        const metadata = {
            startTime,
            endTime: Date.now(),
            count: sessionReports.length,
            verified: isVerified,
            worldIdProof,
            beneficiary: walletAddress || '0x0000000000000000000000000000000000000000'
        };
        filesToUpload.push(new File([JSON.stringify(metadata, null, 2)], 'session-metadata.json', { type: 'application/json' }));

        folderCid = await uploadSessionFolder(filesToUpload, apiKey);
        
        // Update local history
        if (startTime) {
            sessionStore.updateSession(`session-${startTime}`, {
                status: 'uploaded',
                filecoinCid: folderCid,
                walletAddress: walletAddress
            });
        }

      } catch (err: any) {
        console.error('Filecoin upload failed:', err);
        // We continue to submit to backend even if Filecoin fails, but warn user
        // Or we can stop? Let's log warning but continue to backend.
        // Actually, let's throw error to alert user, they can retry.
        throw new Error(`Filecoin upload failed: ${err.message}`);
      }

      // 3. Submit all reports to Backend API
      let uploadedCount = 0;
      setUploadProgress({ current: 0, total: sessionReports.length });
      setUploadStatus('POSTING TO PORTAL...');
      
      for (const report of sessionReports) {
        const formData = new FormData();
        
        const reportWithProof = {
          ...report,
          worldId: worldIdProof,
          status: isVerified ? 'verified' : 'pending',
          session: {
            id: startTime,
            index: uploadedCount + 1,
            total: sessionReports.length,
            folderCid: folderCid // Link individual report to the session folder
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
          setUploadProgress({ current: uploadedCount, total: sessionReports.length });
        }
      }

      if (uploadedCount > 0) {
        // Success!
        alert(`✅ Success! ${uploadedCount} reports verified & posted to Portal.\n\nFilecoin CID: ${folderCid.slice(0, 10)}...`);
        setSessionReports([]);
        setShowSummary(false);
        setUploadProgress({ current: 0, total: 0 });
        // We are now back at the main screen where "Start Patrol" is visible
      } else {
        alert('Upload failed. Please check connection.');
      }

    } catch (err: any) {
      setError(err.message || 'Failed to submit batch');
    } finally {
      setIsSubmittingBatch(false);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard these reports?')) {
      setSessionReports([]);
      setShowSummary(false);
    }
  };

  const handleDeleteReport = (index: number) => {
    setSessionReports(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-asphalt text-white relative overflow-hidden">
      {/* Header */}
      <div className="bg-concrete border-b border-white/5 p-4 flex justify-between items-center z-10 shadow-md">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-md" />
          <div>
            <h1 className="text-lg font-bold font-sans tracking-tight">Pothole Patrol</h1>
            <p className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">AI Dashcam v1.0</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
            {isPatrolling && (
            <div className="flex items-center gap-2 bg-alert-red/20 border border-alert-red/50 px-3 py-1.5 rounded-full animate-pulse">
                <div className="w-2 h-2 bg-alert-red rounded-full shadow-[0_0_8px_rgba(255,61,0,0.8)]" />
                <span className="text-[10px] font-bold text-alert-red uppercase tracking-wider">REC</span>
            </div>
            )}
            <button 
                onClick={() => setShowSettings(true)}
                className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
            >
                <Settings className="w-5 h-5 text-gray-400" />
            </button>
        </div>
      </div>

      {/* Camera View */}
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-black w-full" 
        onClick={handleManualClick}
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Manual Tap Feedback */}
        {manualBox && (
             <div 
                className="absolute border-2 border-safety-yellow bg-safety-yellow/30 z-20 pointer-events-none rounded-lg animate-out fade-out duration-500"
                style={{
                    left: manualBox.x - 50,
                    top: manualBox.y - 50,
                    width: 100,
                    height: 100,
                }}
             />
        )}

        {/* AI Bounding Box Overlay - HIDDEN to reduce rendering lag on mobile */}
        {/* {isPatrolling && detections.map((det, i) => (
          <div
            key={i}
            className="absolute border-2 border-safety-yellow bg-safety-yellow/20 z-10 pointer-events-none"
            style={{
              left: `${(det.boundingBox.x / 640) * 100}%`,
              top: `${(det.boundingBox.y / 640) * 100}%`,
              width: `${(det.boundingBox.width / 640) * 100}%`,
              height: `${(det.boundingBox.height / 640) * 100}%`,
            }}
          >
            <div className="absolute -top-5 left-0 bg-safety-yellow text-black text-[10px] font-bold px-1 rounded">
              {(det.confidence * 100).toFixed(0)}%
            </div>
          </div>
        ))} */}

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
              <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-mono">
                {modelReady ? 'AI Scanning...' : 'Manual Mode'}
              </div>
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

          {!modelReady && !cameraInitializing && (
             <div className="bg-asphalt/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center gap-2 w-fit border border-white/10">
               <Loader2 className="w-3 h-3 animate-spin text-safety-yellow" />
               <span className="text-[10px] font-medium font-mono text-gray-300">LOADING_AI_MODEL...</span>
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
              {modelReady ? 'AI Active • Point at Potholes' : 'Tap screen to simulate detection'}
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
          <div className="w-full">
            <button
              onClick={stopPatrol}
              className="w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-3 bg-alert-red text-white active:scale-[0.98] transition-transform shadow-lg shadow-alert-red/20"
            >
              <div className="w-3 h-3 bg-white rounded-sm" />
              STOP PATROL
            </button>
          </div>
        ) : (
          <button
            onClick={startPatrol}
            disabled={!modelReady && !isPatrolling} // Optional: disable if strictly requiring AI, but manual is fine too. Let's keep it enabled but show loading status above.
            className={cn(
              "w-full py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-transform shadow-lg",
              modelReady 
                ? "bg-safety-yellow text-asphalt active:scale-[0.98] shadow-safety-yellow/20" 
                : "bg-gray-700 text-gray-400 cursor-wait"
            )}
          >
            {modelReady ? (
              <>
                <div className="w-3 h-3 bg-alert-red rounded-full animate-pulse" />
                START PATROL
              </>
            ) : (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                LOADING AI...
              </>
            )}
          </button>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-concrete rounded-2xl p-6 max-w-sm w-full space-y-6 border border-white/10 shadow-2xl">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold text-white">Settings</h3>
                    <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">AI Model Status</label>
                        <div className={cn("px-3 py-2 rounded-lg text-sm flex items-center gap-2", modelReady ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400")}>
                            <Activity className="w-4 h-4" />
                            {modelReady ? 'Ready (YOLOv8n-FineTuned)' : 'Not Loaded'}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <label className="text-sm font-medium text-gray-300">Confidence Threshold</label>
                            <span className="text-sm text-safety-yellow font-mono">{(confidenceThreshold * 100).toFixed(0)}%</span>
                        </div>
                        <input 
                            type="range" 
                            min="0.1" 
                            max="0.9" 
                            step="0.05"
                            value={confidenceThreshold}
                            onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
                            className="w-full accent-safety-yellow h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Rewards Wallet (EVM)</label>
                        <input 
                            type="text" 
                            placeholder="0x..."
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-white/10 rounded-lg text-sm font-mono text-white focus:border-safety-yellow focus:outline-none"
                        />
                        <p className="text-[10px] text-gray-500">Enter your Filecoin FEVM address to receive DePIN rewards.</p>
                    </div>

                    <button 
                        onClick={() => { loadModel(); setShowSettings(false); }}
                        className="w-full py-3 bg-asphalt border border-white/10 hover:border-white/30 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        RELOAD AI MODEL
                    </button>

                    <button 
                        onClick={testModelWithSample}
                        className="w-full py-3 bg-asphalt border border-white/10 hover:border-white/30 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors text-blue-400"
                    >
                        <Activity className="w-4 h-4" />
                        RUN DIAGNOSTIC TEST
                    </button>

                    <div className="pt-4 border-t border-white/10">
                        <button 
                            onClick={() => { setShowSettings(false); setShowHistory(true); setPatrolHistory(sessionStore.getSessions()); }}
                            className="w-full py-3 bg-concrete border border-white/10 hover:bg-white/5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors text-gray-300"
                        >
                            <Clock className="w-4 h-4" />
                            VIEW PATROL HISTORY
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="absolute inset-0 bg-asphalt z-50 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="bg-concrete border-b border-white/10 p-4 flex items-center gap-3 shadow-lg">
                <button onClick={() => setShowHistory(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-6 h-6 text-white" />
                </button>
                <h2 className="text-lg font-bold text-white">Patrol History</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {patrolHistory.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No patrol history found.</p>
                    </div>
                ) : (
                    patrolHistory.map((session) => (
                        <div key={session.id} className="bg-concrete border border-white/5 rounded-xl p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold text-white">
                                        {new Date(session.startTime).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-400 font-mono">
                                        {new Date(session.startTime).toLocaleTimeString()} • {Math.round((session.endTime - session.startTime) / 1000 / 60)} min
                                    </p>
                                </div>
                                <div className={cn("px-2 py-1 rounded text-[10px] font-bold uppercase", 
                                    session.status === 'uploaded' ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                                )}>
                                    {session.status.replace('_', ' ')}
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-300">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-safety-yellow" />
                                    <span>{session.potholeCount} Potholes</span>
                                </div>
                            </div>

                            {session.filecoinCid && (
                                <a 
                                    href={getIPFSUrl(session.filecoinCid)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-center text-xs font-mono text-blue-400 transition-colors border border-blue-500/20"
                                >
                                    VIEW EVIDENCE (IPFS)
                                </a>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
      )}

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
              <button 
                onClick={() => setShowReview(true)}
                disabled={sessionReports.length === 0}
                className="bg-concrete p-5 rounded-2xl border border-white/5 hover:bg-white/5 transition-colors text-left group"
              >
                <div className="text-4xl font-bold text-safety-yellow mb-1 font-mono tracking-tighter group-hover:scale-105 transition-transform">{sessionReports.length}</div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold flex items-center gap-1">
                    Potholes <ArrowLeft className="w-3 h-3 rotate-180" />
                </div>
              </button>
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
              disabled={isSubmittingBatch || sessionReports.length === 0}
              className="w-full py-4 rounded-xl font-bold text-lg bg-white text-asphalt hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 active:scale-[0.99] transition-transform"
            >
              {isSubmittingBatch ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploadStatus || 'PROCESSING...'} {uploadProgress.total > 0 && uploadStatus.includes('PORTAL') ? `(${uploadProgress.current}/${uploadProgress.total})` : ''}
                </>
              ) : (
                <>
                  VERIFY & UPLOAD BATCH
                </>
              )}
            </button>
            
            <button
              onClick={() => {
                setSessionReports([]);
                setShowSummary(false);
              }}
              disabled={isSubmittingBatch}
              className="w-full py-4 rounded-xl font-bold text-sm text-gray-300 hover:text-white transition-colors border border-white/10 hover:bg-white/5"
            >
              RETURN TO CAMERA
            </button>
            
            <button
              onClick={handleDiscard}
              disabled={isSubmittingBatch}
              className="w-full py-4 rounded-xl font-bold text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              DISCARD REPORTS
            </button>
          </div>
        </div>
      )}

      {/* Review Session Modal */}
      {showReview && (
        <div className="absolute inset-0 z-[60] bg-asphalt flex flex-col animate-in slide-in-from-right duration-300">
            <div className="bg-concrete border-b border-white/10 p-4 flex items-center gap-3 shadow-lg sticky top-0 z-10">
                <button onClick={() => setShowReview(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div>
                    <h2 className="text-lg font-bold text-white">Review Session</h2>
                    <p className="text-xs text-gray-400">{sessionReports.length} items pending upload</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {sessionReports.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>No reports remaining.</p>
                    </div>
                ) : (
                    sessionReports.map((report, index) => (
                        <div key={report.id} className="bg-concrete border border-white/5 rounded-xl overflow-hidden">
                            {/* Image Header */}
                            <div className="relative h-48 bg-black">
                                <img 
                                    src={report.image.dataUrl} 
                                    alt="Evidence" 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 right-2 bg-black/70 text-safety-yellow px-2 py-1 rounded text-xs font-bold border border-safety-yellow/30">
                                    {(report.detection.confidence * 100).toFixed(0)}% Confidence
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="text-xs text-gray-400 font-mono uppercase tracking-wider mb-1">Detected At</p>
                                        <p className="text-sm text-white font-medium">
                                            {new Date(report.timestamp).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteReport(index)}
                                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono bg-black/20 p-2 rounded-lg">
                                    <MapPin className="w-3 h-3" />
                                    {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
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
