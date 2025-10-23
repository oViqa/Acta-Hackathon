'use client';

import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface LocationCircleProps {
  center: [number, number] | null;
  radius: number; // in meters
  color?: string;
}

export default function LocationCircle({ center, radius, color = '#f97316' }: LocationCircleProps) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;

    // Create circle
    const circle = L.circle(center, {
      radius,
      color,
      weight: 2,
      opacity: 0.8,
      fillColor: color,
      fillOpacity: 0.1,
      dashArray: '5, 5'
    });

    // Add to map
    circle.addTo(map);

    // Cleanup
    return () => {
      circle.remove();
    };
  }, [map, center, radius, color]);

  return null;
}
