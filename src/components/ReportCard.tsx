'use client';

import { PotholeReport } from '@/types/report';
import { CheckCircle, Clock, Upload, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getIPFSUrl } from '@/lib/filecoin';

interface ReportCardProps {
  report: PotholeReport;
  onPublish?: (reportId: string) => void;
  isPublishing?: boolean;
}

export default function ReportCard({
  report,
  onPublish,
  isPublishing = false,
}: ReportCardProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-gray-500',
      bg: 'bg-gray-100',
      label: 'Pending Review',
    },
    verified: {
      icon: CheckCircle,
      color: 'text-blue-500',
      bg: 'bg-blue-100',
      label: 'World ID Verified',
    },
    published: {
      icon: Upload,
      color: 'text-green-500',
      bg: 'bg-green-100',
      label: 'Published to Filecoin',
    },
  };

  const config = statusConfig[report.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-200">
        <img
          src={report.image.dataUrl}
          alt="Pothole detection"
          className="w-full h-full object-cover"
        />
        
        {/* Status Badge */}
        <div
          className={cn(
            'absolute top-2 right-2 px-3 py-1 rounded-full flex items-center gap-1.5 text-sm font-medium',
            config.bg,
            config.color
          )}
        >
          <StatusIcon className="w-4 h-4" />
          {config.label}
        </div>

        {/* Confidence Badge */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
          {(report.detection.confidence * 100).toFixed(0)}% Confidence
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Timestamp */}
        <div className="text-sm text-gray-600">
          {new Date(report.timestamp).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })}
        </div>

        {/* Location */}
        <div className="text-sm">
          <p className="font-medium text-gray-700">Location</p>
          <p className="text-gray-600">
            {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
          </p>
          {report.location.address && (
            <p className="text-gray-500 text-xs mt-1">{report.location.address}</p>
          )}
        </div>

        {/* World ID */}
        {report.worldId && (
          <div className="text-sm">
            <p className="font-medium text-gray-700 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              World ID Verified
            </p>
            <p className="text-gray-500 text-xs mt-1 font-mono">
              {report.worldId.nullifier_hash.slice(0, 16)}...
            </p>
          </div>
        )}

        {/* Filecoin CID */}
        {report.filecoin && (
          <div className="text-sm">
            <p className="font-medium text-gray-700 flex items-center gap-1">
              <Upload className="w-4 h-4 text-blue-500" />
              Filecoin Storage
            </p>
            <a
              href={getIPFSUrl(report.filecoin.cid)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 text-xs font-mono flex items-center gap-1 mt-1"
            >
              {report.filecoin.cid.slice(0, 20)}...
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Publish Button */}
        {report.status === 'verified' && onPublish && (
          <button
            onClick={() => onPublish(report.id)}
            disabled={isPublishing}
            className={cn(
              'w-full py-2 px-4 rounded-lg font-medium text-sm flex items-center justify-center gap-2',
              isPublishing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            )}
          >
            {isPublishing ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Publish to Filecoin
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
