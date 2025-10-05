'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Users, Clock, Calendar, Plus, User } from 'lucide-react';
import JoinEventModal from '../events/JoinEventModal';
import EventChat from '../chat/EventChat';
import { eventsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

interface Event {
  id: string;
  title: string;
  description?: string;
  location: { lat: number; lng: number };
  city: string;
  startTime: string;
  attendeeLimit: number;
  attendeeCount: number;
  organizer?: { name: string; avatar?: string };
}

interface MapViewProps {
  onCreateEvent: () => void;
  onLogin: () => void;
  user: any;
}

export default function MapView({ onCreateEvent, onLogin, user }: MapViewProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isJoinEventModalOpen, setIsJoinEventModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedEventForJoin, setSelectedEventForJoin] = useState<Event | null>(null);
  const [selectedEventForChat, setSelectedEventForChat] = useState<Event | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(20);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const puddingIcon = useMemo(() =>
    L.divIcon({
      className: '',
      html:
        '<div style="width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#fff;font-size:16px;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,.15)">🍮</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    }),
  []);

  const meIcon = useMemo(() =>
    L.divIcon({
      className: '',
      html:
        '<div style="width:22px;height:22px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:#2563eb;color:#fff;font-size:12px;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,.15)">●</div>',
      iconSize: [22, 22],
      iconAnchor: [11, 22],
      popupAnchor: [0, -22],
    }),
  []);

  // Germany center coordinates
  const defaultCenter: [number, number] = [51.1657, 10.4515];
  const defaultZoom = 6;

  const fetchEvents = async (opts?: { lat?: number; lng?: number; radiusKm?: number }) => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (opts?.lat && opts?.lng) {
        params.lat = opts.lat;
        params.lng = opts.lng;
        params.radius = (opts.radiusKm ?? radiusKm) * 1000; // meters
      }
      const response = await eventsAPI.getEvents(params);
      const payload = response.data;
      const list = (payload.events ?? payload) as any[];
      const mapped: Event[] = list.map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        location: e.location ?? { lat: e.location?.lat ?? e.location?.coordinates?.[1], lng: e.location?.lng ?? e.location?.coordinates?.[0] },
        city: e.city,
        startTime: e.startTime,
        attendeeLimit: e.attendeeLimit,
        attendeeCount: e.attendeeCount ?? 0,
        organizer: e.organizer,
      }));
      setEvents(mapped);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // fallback to mock data (unchanged)
      const mockEvents: Event[] = [
        { id: '1', title: 'Schoko-Pudding Sonntag', location: { lat: 52.520008, lng: 13.404954 }, city: 'Berlin', startTime: '2025-10-06T15:00:00Z', attendeeLimit: 15, attendeeCount: 8 },
        { id: '2', title: 'Vanille Vibes', location: { lat: 48.1351, lng: 11.5820 }, city: 'Munich', startTime: '2025-10-07T14:00:00Z', attendeeLimit: 12, attendeeCount: 5 },
        { id: '3', title: 'Caramel Connect', location: { lat: 50.1109, lng: 8.6821 }, city: 'Frankfurt', startTime: '2025-10-08T16:00:00Z', attendeeLimit: 20, attendeeCount: 12 },
      ];
      setEvents(mockEvents);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // initial fetch (no location filter)
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch when userLocation or radius changes
  useEffect(() => {
    if (userLocation) {
      fetchEvents({ lat: userLocation.lat, lng: userLocation.lng, radiusKm });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(userLocation), radiusKm]);

  const requestLocation = () => {
    if (!user) {
      toast({ title: 'Login required', description: 'Please login to use location-based search.' });
      onLogin();
      return;
    }
    if (!('geolocation' in navigator)) {
      toast({ title: 'Geolocation not supported', description: 'Your browser does not support geolocation.', variant: 'destructive' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        toast({ title: 'Location set', description: 'Using your current location.' });
      },
      (err) => {
        console.error(err);
        toast({ title: 'Permission denied', description: 'Cannot access your location.', variant: 'destructive' });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleJoinEventSubmit = (joinData: any) => {
    console.log('Joining event:', joinData);
    // TODO: Implement actual join request
    alert('Join request submitted! Waiting for organizer approval.');
  };

  const handleChatOpen = () => {
    setSelectedEventForChat(selectedEvent);
    setIsChatOpen(true);
  };

  const formatTimeUntilEvent = (startTime: string) => {
    const now = new Date();
    const eventTime = new Date(startTime);
    const diff = eventTime.getTime() - now.getTime();
    
    if (diff < 0) return 'Event ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `In ${days}d ${hours}h`;
    if (hours > 0) return `In ${hours}h ${minutes}m`;
    return `In ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading Pudding Events</h2>
          <p className="text-gray-600">Finding the sweetest meetups across Germany...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gray-50">
      {/* Kleinanzeigen-style Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white text-xl">🍮</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900">Pudding mit Gabel</h1>
                <p className="text-xs text-gray-500">Find your pudding people</p>
              </div>
            </div>
            
            {/* Right controls: radius + location + create/login */}
            <div className="flex items-center gap-3">
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:border-gray-400"
                title="Radius"
              >
                {[5,10,20,30,50].map(km => (
                  <option key={km} value={km}>{km} km</option>
                ))}
              </select>

              <button
                onClick={requestLocation}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
                title="Use my location"
              >
                Use My Location
              </button>

              <button
                onClick={onCreateEvent}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </button>

              {user ? (
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </button>
              ) : (
                <button
                  onClick={onLogin}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
                >
                  Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="h-full w-full pt-16">
        <MapContainer
          center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
          zoom={userLocation ? 10 : defaultZoom}
          className="h-full w-full z-0"
          style={{ height: '100vh', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={meIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {events.map((event) => (
            <Marker
              key={event.id}
              position={[event.location.lat, event.location.lng]}
              icon={puddingIcon}
              eventHandlers={{ click: () => setSelectedEvent(event) }}
            >
              <Popup className="custom-popup">
                <div className="p-4 min-w-[280px]">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-gray-900 leading-tight">{event.title}</h3>
                    <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 ml-2">×</button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-primary-500" /><span>{event.city}</span></div>
                    <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-primary-500" /><span>{new Date(event.startTime).toLocaleDateString()}</span></div>
                    <div className="flex items-center space-x-2"><Clock className="w-4 h-4 text-primary-500" /><span>{new Date(event.startTime).toLocaleTimeString()}</span></div>
                    <div className="flex items-center space-x-2"><Users className="w-4 h-4 text-primary-500" /><span>{event.attendeeCount}/{event.attendeeLimit} joined</span></div>
                  </div>
                  <button 
                    onClick={() => { setSelectedEventForJoin(event); setIsJoinEventModalOpen(true); }}
                    className="bg-orange-500 hover:bg-orange-600 text-white w-full text-sm py-2 rounded-lg"
                  >
                    Join Event 🍮
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-4">
          <div className="apple-card max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedEvent.title}
                </h2>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              {selectedEvent.description && (
                <p className="text-gray-600 mb-6">{selectedEvent.description}</p>
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{selectedEvent.city}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(selectedEvent.startTime).toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{selectedEvent.attendeeCount}/{selectedEvent.attendeeLimit} attendees</span>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setSelectedEventForJoin(selectedEvent);
                    setIsJoinEventModalOpen(true);
                  }}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                >
                  Join Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Event Modal */}
      <JoinEventModal
        isOpen={isJoinEventModalOpen}
        onClose={() => setIsJoinEventModalOpen(false)}
        event={selectedEventForJoin}
        onSubmit={handleJoinEventSubmit}
      />

      {/* Event Chat */}
      <EventChat
        eventId={selectedEventForChat?.id || ''}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        event={selectedEventForChat}
      />
    </div>
  );
}