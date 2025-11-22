'use client';

import { useEffect, useState } from 'react';
import { Download, RefreshCw, Database } from 'lucide-react';
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
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🚧 Pothole Patrol Portal</h1>
            <p className="text-sm opacity-90">Open Data Dashboard</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={fetchReports}
              disabled={isLoading}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RefreshCw className={cn('w-5 h-5', isLoading && 'animate-spin')} />
              Refresh
            </button>
            
            <button
              onClick={handleExport}
              disabled={publishedReports.length === 0}
              className={cn(
                'px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors',
                publishedReports.length > 0
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
              )}
            >
              <Download className="w-5 h-5" />
              Export Knowledge Graph
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900">{reports.length}</div>
            <div className="text-sm text-gray-600">Total Reports</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-500">{pendingReports.length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{verifiedReports.length}</div>
            <div className="text-sm text-gray-600">Verified</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">{publishedReports.length}</div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Report List */}
        <div className="w-96 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Reports Feed
            </h2>
          </div>
          
          <div className="p-4 space-y-4">
            {isLoading && reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2" />
                Loading reports...
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No reports yet. Start using the dashcam!
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
        <div className="flex-1 relative">
          <Map
            reports={reports}
            onReportClick={setSelectedReport}
          />
        </div>
      </div>
    </div>
  );
}
