'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

// Create a custom component that handles map clicks
const MapClickHandler = dynamic(() => 
  import('react-leaflet').then(mod => {
    const { useMap } = mod;
    return function MapClickHandler({ onLocationSelect }: { onLocationSelect: (location: { lat: number; lng: number }) => void }) {
      const map = useMap();
      
      useEffect(() => {
        const handleMapClick = (e: L.LeafletMouseEvent) => {
          const { lat, lng } = e.latlng;
          onLocationSelect({ lat, lng });
        };

        map.on('click', handleMapClick);
        return () => {
          map.off('click', handleMapClick);
        };
      }, [map, onLocationSelect]);

      return null;
    };
  }), { ssr: false });

// Simplified approach - just use regular Marker with click handler

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat: number; lng: number };
  height?: string;
}

// Custom teardrop marker icon for location selection (like in the reference image)
const createLocationIcon = () =>
  L.divIcon({
    className: 'location-picker-marker',
    html: `
      <div style="
        width: 0;
        height: 0;
        border-left: 12px solid transparent;
        border-right: 12px solid transparent;
        border-top: 20px solid #f97316;
        position: relative;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      ">
        <div style="
          position: absolute;
          top: -32px;
          left: -8px;
          width: 16px;
          height: 16px;
          background: #f97316;
          border-radius: 50%;
          border: 2px solid white;
        "></div>
      </div>
    `,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -32],
  });


export default function LocationPicker({ 
  onLocationSelect, 
  initialLocation = { lat: 52.520008, lng: 13.404954 }, // Default to Berlin
  height = "300px" 
}: LocationPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number }>(initialLocation);
  const [isLoading, setIsLoading] = useState(false);

  const handleLocationSelect = async (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    setIsLoading(true);
    
    try {
      // Reverse geocoding to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      
      const address = data.display_name || `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
      onLocationSelect({ ...location, address });
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      onLocationSelect(location);
    } finally {
      setIsLoading(false);
    }
  };

  const locationIcon = createLocationIcon();

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center gap-2 text-sm text-gray-600">
        <MapPin className="w-4 h-4" />
        <span>(Click on map to place marker)</span>
        {isLoading && <span className="text-xs text-gray-400">Loading address...</span>}
      </div>
      
      <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height }}>
        <MapContainer
          center={[selectedLocation.lat, selectedLocation.lng]}
          zoom={13}
          className="h-full w-full"
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          
          <Marker 
            position={[selectedLocation.lat, selectedLocation.lng]} 
            icon={locationIcon}
          />
        </MapContainer>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span className="text-sm">Getting address...</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Selected location info */}
      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <strong>Selected location:</strong>
        </div>
        <div className="text-sm font-mono text-gray-800">
          {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
        </div>
      </div>
    </div>
  );
}
