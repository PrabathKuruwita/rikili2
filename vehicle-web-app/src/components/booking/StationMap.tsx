import React, { useMemo } from 'react';
import type { Station } from '../../types';

export function StationMap({
  stations,
  selectedId,
  onSelect,
}: {
  stations: Station[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const bounds = useMemo(() => {
    if (stations.length === 0) {
      return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
    }
    const lats = stations.map((s) => s.lat);
    const lngs = stations.map((s) => s.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [stations]);

  function toPosition(lat: number, lng: number) {
    const latRange = bounds.maxLat - bounds.minLat || 0.01;
    const lngRange = bounds.maxLng - bounds.minLng || 0.01;
    return {
      left: `${((lng - bounds.minLng) / lngRange) * 80 + 10}%`,
      top: `${((bounds.maxLat - lat) / latRange) * 70 + 15}%`,
    };
  }

  return (
    <div className="relative h-full w-full bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="absolute inset-0 opacity-30">
        <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {stations.map((station) => {
        const pos = toPosition(station.lat, station.lng);
        const selected = station.id === selectedId;
        return (
          <button
            key={station.id}
            type="button"
            aria-label={station.name}
            onClick={() => onSelect(station.id)}
            className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 ${
              selected ? 'h-5 w-5 bg-accent' : 'h-4 w-4 bg-slate-500'
            }`}
            style={pos}
            title={station.name}
          />
        );
      })}

      <div className="absolute bottom-3 left-3 rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-600 backdrop-blur">
        {stations.length} station{stations.length !== 1 && 's'} on map
      </div>
    </div>
  );
}
