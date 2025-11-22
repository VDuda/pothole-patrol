'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { PotholeReport } from '@/types/report';

interface MapProps {
  reports: PotholeReport[];
  onReportClick?: (report: PotholeReport) => void;
  center?: [number, number];
  zoom?: number;
}

export default function MapComponent({
  reports,
  onReportClick,
  center = [-58.3816, -34.6037], // Buenos Aires
  zoom = 12,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<globalThis.Map<string, mapboxgl.Marker>>(new globalThis.Map());
  const [isLoaded, setIsLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
    });

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, [center, zoom]);

  // Update markers when reports change
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Remove old markers
    markersRef.current.forEach((marker: mapboxgl.Marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    reports.forEach((report) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.cursor = 'pointer';
      
      // Color based on status
      const color =
        report.status === 'published'
          ? '#10b981' // green
          : report.status === 'verified'
          ? '#3b82f6' // blue
          : '#6b7280'; // grey

      el.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([report.location.longitude, report.location.latitude])
        .addTo(map.current!);

      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <p class="font-bold text-sm mb-1">
            ${report.status === 'published' ? '✅' : report.status === 'verified' ? '🔵' : '⏳'} 
            ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}
          </p>
          <p class="text-xs text-gray-600 mb-2">
            ${new Date(report.timestamp).toLocaleString()}
          </p>
          <p class="text-xs">
            Confidence: ${(report.detection.confidence * 100).toFixed(0)}%
          </p>
          ${report.worldId ? '<p class="text-xs text-green-600 mt-1">✓ World ID Verified</p>' : ''}
          ${report.filecoin ? `<p class="text-xs text-blue-600 mt-1">📦 CID: ${report.filecoin.cid.slice(0, 12)}...</p>` : ''}
        </div>
      `);

      marker.setPopup(popup);

      // Click handler
      el.addEventListener('click', () => {
        if (onReportClick) {
          onReportClick(report);
        }
      });

      markersRef.current.set(report.id, marker);
    });
  }, [reports, isLoaded, onReportClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <p className="font-bold mb-2">Legend</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span>Published (Filecoin)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Verified (World ID)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gray-500"></div>
            <span>Pending</span>
          </div>
        </div>
      </div>
    </div>
  );
}
