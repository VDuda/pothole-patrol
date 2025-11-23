'use client';

import { useEffect, useState } from 'react';
import { Download, RefreshCw, Database, Activity, Check, Clock, Upload } from 'lucide-react';
import Map from '@/components/Map';
import ReportCard from '@/components/ReportCard';
import { PotholeReport, JSONLDDataset } from '@/types/report';
import { uploadToFilecoin, uploadMetadataToFilecoin } from '@/lib/filecoin';
import { cn } from '@/lib/utils';

export default function PortalPage() {
  const [reports, setReports] = useState<PotholeReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<PotholeReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch reports
  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/reports');
      const data = await response.json();
      
      if (data.success) {
        setReports(data.reports);
      } else {
        setError('Failed to load reports');
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, []);

  // Publish report to Filecoin
  const handlePublish = async (reportId: string) => {
    const report = reports.find((r) => r.id === reportId);
    if (!report) return;

    setPublishingId(reportId);
    setError(null);

    try {
      const apiKey = process.env.NEXT_PUBLIC_LIGHTHOUSE_API_KEY;
      if (!apiKey) {
        throw new Error('Lighthouse API key not configured');
      }

      // Upload image to Filecoin
      const imageCid = await uploadToFilecoin(report.image.blob!, apiKey);

      // Create metadata
      const metadata = {
        id: report.id,
        timestamp: report.timestamp,
        location: report.location,
        detection: report.detection,
        worldId: report.worldId,
        imageCid: imageCid,
      };

      // Upload metadata to Filecoin
      const metadataCid = await uploadMetadataToFilecoin(metadata, apiKey);

      // Update report status
      const updateResponse = await fetch('/api/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: reportId,
          updates: {
            status: 'published',
            filecoin: {
              cid: imageCid,
              uploadDate: new Date().toISOString(),
              metadataCid: metadataCid,
            },
          },
        }),
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update report');
      }

      // Refresh reports
      await fetchReports();
      alert('Report published to Filecoin successfully! 🎉');
    } catch (err: any) {
      setError(err.message || 'Failed to publish report');
      console.error(err);
    } finally {
      setPublishingId(null);
    }
  };

  // Export Knowledge Graph as JSON-LD
  const handleExport = () => {
    const publishedReports = reports.filter((r) => r.status === 'published');

    const dataset: JSONLDDataset = {
      '@context': 'https://schema.org',
      '@type': 'Dataset',
      name: 'Buenos Aires Road Quality Index',
      creator: 'Pothole Patrol DAO',
      variableMeasured: 'Pothole Severity',
      distribution: publishedReports.map((report) => ({
        '@type': 'DataDownload',
        contentUrl: `ipfs://${report.filecoin!.cid}`,
        encodingFormat: 'image/jpeg',
        uploadDate: report.filecoin!.uploadDate,
        verificationMethod: report.worldId ? 'WorldID-ZK-Proof' : 'None',
        location: {
          '@type': 'GeoCoordinates',
          latitude: report.location.latitude,
          longitude: report.location.longitude,
        },
      })),
    };

    // Download as JSON file
    const blob = new Blob([JSON.stringify(dataset, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pothole-patrol-knowledge-graph-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const pendingReports = reports.filter((r) => r.status === 'pending');
  const verifiedReports = reports.filter((r) => r.status === 'verified');
  const publishedReports = reports.filter((r) => r.status === 'published');

  return (
    <div className="flex flex-col h-screen bg-asphalt text-white">
      {/* Header */}
      <div className="bg-concrete border-b border-white/5 p-4 shadow-lg z-20">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-lg shadow-lg shadow-yellow-500/20" />
             <div>
                <h1 className="text-xl font-bold tracking-tight">Pothole Patrol</h1>
                <p className="text-xs text-gray-400 font-mono uppercase tracking-wider">Open Data Portal</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={fetchReports}
              disabled={isLoading}
              className="px-4 py-2 bg-asphalt border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-lg flex items-center gap-2 transition-all text-sm font-medium"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
              Refresh
            </button>
            
            <button
              onClick={handleExport}
              disabled={publishedReports.length === 0}
              className={cn(
                'px-4 py-2 rounded-lg flex items-center gap-2 font-bold text-sm transition-all shadow-lg',
                publishedReports.length > 0
                  ? 'bg-safety-yellow text-asphalt hover:bg-yellow-400 hover:scale-105'
                  : 'bg-concrete text-gray-500 cursor-not-allowed border border-white/5'
              )}
            >
              <Download className="w-4 h-4" />
              Export Knowledge Graph
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-concrete/50 border-b border-white/5 backdrop-blur-sm">
        <div className="max-w-[1920px] mx-auto grid grid-cols-4 divide-x divide-white/5">
          <div className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-white font-mono">{reports.length}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Total Reports</div>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-gray-400 font-mono">{pendingReports.length}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Pending</div>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-blue-400 font-mono">{verifiedReports.length}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Verified</div>
          </div>
          <div className="p-4 flex flex-col items-center">
            <div className="text-2xl font-bold text-green-400 font-mono">{publishedReports.length}</div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Published</div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border-l-4 border-red-500 text-red-400 p-4">
          <p className="font-medium text-sm">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Report List */}
        <div className="w-[400px] bg-asphalt border-r border-white/5 overflow-y-auto flex flex-col">
          <div className="p-4 border-b border-white/5 bg-concrete/30 sticky top-0 backdrop-blur-md z-10">
            <h2 className="text-sm font-bold text-gray-300 flex items-center gap-2 uppercase tracking-wider">
              <Database className="w-4 h-4" />
              Incoming Feed
            </h2>
          </div>
          
          <div className="p-4 space-y-4 flex-1">
            {isLoading && reports.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 opacity-50" />
                <p className="text-xs font-mono uppercase">Syncing Node...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-12 text-gray-500 border-2 border-dashed border-white/5 rounded-xl">
                <p className="text-sm">No reports yet.</p>
                <p className="text-xs mt-1 opacity-50">Start the dashcam to begin.</p>
              </div>
            ) : (
              reports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onPublish={handlePublish}
                  isPublishing={publishingId === report.id}
                />
              ))
            )}
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 relative bg-gray-900">
          <Map
            reports={reports}
            onReportClick={setSelectedReport}
          />
        </div>
      </div>
    </div>
  );
}