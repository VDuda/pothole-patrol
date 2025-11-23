'use client';

import { PotholeReport } from '@/types/report';
import { CheckCircle, Clock, Upload, ExternalLink, AlertTriangle, MapPin, Fingerprint } from 'lucide-react';
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
      color: 'text-gray-400',
      bg: 'bg-gray-500/10 border-gray-500/20',
      label: 'PENDING',
    },
    verified: {
      icon: CheckCircle,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
      label: 'VERIFIED',
    },
    published: {
      icon: Upload,
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
      label: 'ON-CHAIN',
    },
  };

  const config = statusConfig[report.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-concrete border border-white/5 rounded-xl overflow-hidden hover:border-safety-yellow/30 transition-all hover:shadow-lg group">
      {/* Image Header */}
      <div className="relative h-48 bg-black">
        <img
          src={report.image.dataUrl}
          alt="Pothole detection"
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        />
        
        {/* Status Badge */}
        <div
          className={cn(
            'absolute top-3 right-3 px-3 py-1 rounded-full flex items-center gap-1.5 text-[10px] font-bold border backdrop-blur-md',
            config.bg,
            config.color
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </div>

        {/* Confidence Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <div className="bg-black/80 text-white px-2 py-1 rounded-md text-[10px] font-mono border border-white/10 flex items-center gap-1.5">
                <AlertTriangle className="w-3 h-3 text-safety-yellow" />
                CONF: {(report.detection.confidence * 100).toFixed(0)}%
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Time
                </p>
                <p className="text-xs text-gray-300 font-mono">
                    {new Date(report.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
            <div>
                <p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Coords
                </p>
                <p className="text-xs text-gray-300 font-mono truncate" title={`${report.location.latitude}, ${report.location.longitude}`}>
                    {report.location.latitude.toFixed(4)}, {report.location.longitude.toFixed(4)}
                </p>
            </div>
        </div>

        {/* Verifications */}
        <div className="space-y-2 pt-2 border-t border-white/5">
            {report.worldId ? (
                <div className="flex items-center justify-between text-xs bg-blue-500/5 p-2 rounded-lg border border-blue-500/10">
                    <div className="flex items-center gap-2 text-blue-400">
                        <Fingerprint className="w-3 h-3" />
                        <span className="font-bold">World ID</span>
                    </div>
                    <span className="font-mono text-gray-500 text-[10px]">{report.worldId.nullifier_hash.slice(0, 8)}...</span>
                </div>
            ) : (
                <div className="text-xs text-gray-600 italic px-1">Waiting for verification...</div>
            )}

            {report.filecoin && (
                <div className="flex items-center justify-between text-xs bg-green-500/5 p-2 rounded-lg border border-green-500/10">
                    <div className="flex items-center gap-2 text-green-400">
                        <Upload className="w-3 h-3" />
                        <span className="font-bold">Filecoin</span>
                    </div>
                    <a
                        href={getIPFSUrl(report.filecoin.cid)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white flex items-center gap-1 font-mono text-[10px] transition-colors"
                    >
                        CID: {report.filecoin.cid.slice(0, 6)}...
                        <ExternalLink className="w-2 h-2" />
                    </a>
                </div>
            )}
        </div>

        {/* Action Button */}
        {report.status === 'verified' && onPublish && (
          <button
            onClick={() => onPublish(report.id)}
            disabled={isPublishing}
            className={cn(
              'w-full py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 uppercase tracking-wide transition-all',
              isPublishing
                ? 'bg-concrete border border-white/10 text-gray-500 cursor-not-allowed'
                : 'bg-safety-yellow text-asphalt hover:bg-yellow-400 hover:shadow-lg hover:shadow-yellow-500/10 active:scale-[0.98]'
            )}
          >
            {isPublishing ? (
              <>
                <div className="w-3 h-3 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                UPLOADING...
              </>
            ) : (
              <>
                <Upload className="w-3 h-3" />
                PUBLISH TO FILECOIN
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}