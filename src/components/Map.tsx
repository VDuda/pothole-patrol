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
      style: 'mapbox://styles/mapbox/dark-v11', // Matches the industrial dark theme perfectly
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
      el.style.width = '24px'; // Slightly smaller for cleaner look
      el.style.height = '24px';
      el.style.cursor = 'pointer';
      
      // Industrial Palette Colors
      // Pending: Gray/White
      // Verified: Blue (World ID)
      // Published: Green (Filecoin)
      let color = '#9ca3af'; // Gray 400 (Pending)
      let pulseClass = '';

      if (report.status === 'published') {
        color = '#00E676'; // Signal Green
      } else if (report.status === 'verified') {
        color = '#3b82f6'; // Blue 500
      }

      // SVG Marker
      el.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="2"/>
          <circle cx="12" cy="12" r="4" fill="${color}"/>
        </svg>
      `;

      const marker = new mapboxgl.Marker(el)
        .setLngLat([report.location.longitude, report.location.latitude])
        .addTo(map.current!);

      // Styled Popup
      const popup = new mapboxgl.Popup({ 
        offset: 25,
        className: 'industrial-popup',
        closeButton: false
      }).setHTML(`
        <div class="p-3 bg-concrete text-white rounded-lg shadow-xl border border-white/10 min-w-[200px]">
          <div class="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
            <span class="text-lg">
                ${report.status === 'published' ? '✅' : report.status === 'verified' ? '🔵' : '⏳'}
            </span>
            <div>
                <p class="font-bold text-xs uppercase tracking-wider text-gray-300">
                    ${report.status}
                </p>
                <p class="text-[10px] text-gray-500 font-mono">
                    ${new Date(report.timestamp).toLocaleTimeString()}
                </p>
            </div>
          </div>
          
          <div class="space-y-1">
             <div class="flex justify-between text-xs">
                <span class="text-gray-500">Confidence</span>
                <span class="font-mono font-bold text-safety-yellow">${(report.detection.confidence * 100).toFixed(0)}%</span>
             </div>
             ${report.worldId ? `
                 <div class="flex justify-between text-xs">
                    <span class="text-gray-500">World ID</span>
                    <span class="font-mono text-blue-400">Verified</span>
                 </div>
             ` : ''}
             ${report.filecoin ? `
                 <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Storage</span>
                    <span class="font-mono text-green-400">Filecoin</span>
                 </div>
             ` : ''}
          </div>
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
    <div className="relative w-full h-full bg-asphalt">
      <div ref={mapContainer} className="w-full h-full" />
      
      {/* Industrial Legend */}
      <div className="absolute bottom-6 left-6 bg-concrete/90 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-2xl z-10">
        <p className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-3">Network Status</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(0,230,118,0.5)]"></div>
            <span className="text-xs font-bold text-white">Immutable (Filecoin)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-xs font-medium text-gray-300">Verified (World ID)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            <span className="text-xs font-medium text-gray-500">Pending Review</span>
          </div>
        </div>
      </div>
    </div>
  );
}