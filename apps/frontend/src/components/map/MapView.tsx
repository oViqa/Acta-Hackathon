'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Users, Clock, Calendar, Plus, User, Crown, Trophy, Shield } from 'lucide-react';
import JoinEventModal from '../events/JoinEventModal';
import EventChat from '../chat/EventChat';
import EventDashboard from '../events/EventDashboard';
import Leaderboard from '../leaderboard/Leaderboard';
import AdminLogin from '../admin/AdminLogin';
import AdminDashboard from '../admin/AdminDashboard';
import { MapLoadingSkeleton } from '../ui/LoadingSkeleton';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageToggle from '../ui/LanguageToggle';
import FloatingActionButton from '../ui/FloatingActionButton';
import LocationCircle from './LocationCircle';
import { eventsAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
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
  organizer?: { id: string; name: string; avatar?: string };
  createdAt?: string;
  isHot?: boolean;
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
  const { t } = useTranslation();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [isJoinEventModalOpen, setIsJoinEventModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedEventForJoin, setSelectedEventForJoin] = useState<Event | null>(null);
  const [selectedEventForChat, setSelectedEventForChat] = useState<Event | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(20);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [rippleKey, setRippleKey] = useState(0);
  const mapRef = useRef<any>(null);
  const [showEventDashboard, setShowEventDashboard] = useState(false);
  const [selectedEventForDashboard, setSelectedEventForDashboard] = useState<Event | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const puddingIcon = useMemo(() =>
    L.divIcon({
      className: 'pudding-marker',
      html:
        '<div class="pudding-marker-inner" style="width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#fff;font-size:16px;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,.15);position:relative;">🍮</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    }),
  []);

  const hotPuddingIcon = useMemo(() =>
    L.divIcon({
      className: 'hot-pudding-marker',
      html:
        '<div class="hot-pudding-marker-inner" style="width:28px;height:28px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#ff4757,#ff3838);color:#fff;font-size:16px;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,.15);position:relative;animation:pulse 2s infinite;"><span style="position:absolute;top:-8px;right:-8px;background:#ff4757;color:white;font-size:8px;padding:2px 4px;border-radius:4px;font-weight:bold;">🔥</span>🍮</div>',
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
      const mapped: Event[] = list.map((e: any) => {
        const createdAt = e.createdAt ? new Date(e.createdAt) : new Date(Date.now() - Math.random() * 86400000); // Random within last 24h for demo
        const isHot = (Date.now() - createdAt.getTime()) < 10 * 60 * 1000; // Hot if created within last 10 minutes
        
        return {
          id: e.id,
          title: e.title,
          description: e.description,
          location: e.location ?? { lat: e.location?.lat ?? e.location?.coordinates?.[1], lng: e.location?.lng ?? e.location?.coordinates?.[0] },
          city: e.city,
          startTime: e.startTime,
          attendeeLimit: e.attendeeLimit,
          attendeeCount: e.attendeeCount ?? 0,
          organizer: e.organizer,
          createdAt: createdAt.toISOString(),
          isHot,
        };
      });
      setEvents(mapped);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      // fallback to mock data with hot events
      const now = new Date();
      const mockEvents: Event[] = [
        { 
          id: '1', 
          title: 'Schoko-Pudding Sonntag', 
          location: { lat: 52.520008, lng: 13.404954 }, 
          city: 'Berlin', 
          startTime: '2025-10-06T15:00:00Z', 
          attendeeLimit: 15, 
          attendeeCount: 8,
          createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 minutes ago - HOT!
          isHot: true
        },
        { 
          id: '2', 
          title: 'Vanille Vibes', 
          location: { lat: 48.1351, lng: 11.5820 }, 
          city: 'Munich', 
          startTime: '2025-10-07T14:00:00Z', 
          attendeeLimit: 12, 
          attendeeCount: 5,
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          isHot: false
        },
        { 
          id: '3', 
          title: 'Caramel Connect', 
          location: { lat: 50.1109, lng: 8.6821 }, 
          city: 'Frankfurt', 
          startTime: '2025-10-08T16:00:00Z', 
          attendeeLimit: 20, 
          attendeeCount: 12,
          createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
          isHot: false
        },
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

  const handleEventDashboardOpen = () => {
    setSelectedEventForDashboard(selectedEvent);
    setShowEventDashboard(true);
  };

  const handleMarkerClick = (event: Event) => {
    setSelectedEvent(event);
    setRippleKey(prev => prev + 1);
  };

  const handleAdminSuccess = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
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

  if (isAdmin) {
    return <AdminDashboard />;
  }

  if (isLoading) {
    return <MapLoadingSkeleton />;
  }

  return (
    <div className="relative h-screen bg-gray-50 dark:bg-gray-900">
      {/* Kleinanzeigen-style Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white text-xl">🍮</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-gray-900 dark:text-white">{t('app.title')}</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('app.subtitle')}</p>
              </div>
            </div>
            
            {/* Right controls: radius + location + create/login */}
            <div className="flex items-center gap-3">
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm hover:border-gray-400 dark:hover:border-gray-500"
                title="Radius"
              >
                {[5,10,20,30,50].map(km => (
                  <option key={km} value={km}>{km} {t('radius.km')}</option>
                ))}
              </select>

              <button
                onClick={requestLocation}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hover:scale-105 active:scale-95"
                title={t('use.location')}
              >
                {t('use.location')}
              </button>

              <button
                onClick={() => setShowLeaderboard(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors hover:scale-105 active:scale-95"
                title="View leaderboard"
              >
                <Trophy className="w-4 h-4" />
                <span>🏆</span>
              </button>

              <button
                onClick={onCreateEvent}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-sm transition-colors hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{t('create.event')}</span>
              </button>

              <button
                onClick={() => setShowAdminLogin(true)}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:scale-105 active:scale-95"
                title="Admin access"
              >
                <Shield className="w-4 h-4" />
              </button>

              <ThemeToggle />
              <LanguageToggle />

              {user ? (
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors hover:scale-105 active:scale-95">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                </button>
              ) : (
                <button
                  onClick={onLogin}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:scale-105 active:scale-95"
                >
                  {t('login')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="h-full w-full pt-16 relative">
        <MapContainer
          center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
          zoom={userLocation ? 10 : defaultZoom}
          className="h-full w-full z-0"
          style={{ height: '100vh', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Location Circle - shows search radius */}
          {userLocation && (
            <LocationCircle 
              center={[userLocation.lat, userLocation.lng]} 
              radius={radiusKm * 1000} 
              color="#ff6b9d"
            />
          )}

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={meIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}

          {events.map((event) => (
            <Marker
              key={event.id}
              position={[event.location.lat, event.location.lng]}
              icon={event.isHot ? hotPuddingIcon : puddingIcon}
              eventHandlers={{ click: () => handleMarkerClick(event) }}
            >
              <Popup className="custom-popup">
                <div className="p-4 min-w-[280px]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{event.title}</h3>
                      {event.isHot && (
                        <span className="animate-hot-badge bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                          🔥 HOT
                        </span>
                      )}
                    </div>
                    <button onClick={() => setSelectedEvent(null)} className="text-gray-400 hover:text-gray-600 ml-2">×</button>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2"><MapPin className="w-4 h-4 text-primary-500" /><span>{event.city}</span></div>
                    <div className="flex items-center space-x-2"><Calendar className="w-4 h-4 text-primary-500" /><span>{new Date(event.startTime).toLocaleDateString()}</span></div>
                    <div className="flex items-center space-x-2"><Clock className="w-4 h-4 text-primary-500" /><span>{new Date(event.startTime).toLocaleTimeString()}</span></div>
                    <div className="flex items-center space-x-2"><Users className="w-4 h-4 text-primary-500" /><span>{event.attendeeCount}/{event.attendeeLimit} joined</span></div>
                  </div>
                  <div className="flex gap-2">
                    {user && event.organizer?.id === user.id ? (
                      <button 
                        onClick={handleEventDashboardOpen}
                        className="bg-blue-500 hover:bg-blue-600 text-white flex-1 text-sm py-2 rounded-lg transition-colors hover:scale-105 active:scale-95"
                      >
                        Manage Event 📊
                      </button>
                    ) : (
                      <button 
                        onClick={() => { setSelectedEventForJoin(event); setIsJoinEventModalOpen(true); }}
                        className="bg-orange-500 hover:bg-orange-600 text-white flex-1 text-sm py-2 rounded-lg transition-colors hover:scale-105 active:scale-95"
                      >
                        Join Event 🍮
                      </button>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        
        {/* Ripple Effect Overlay */}
        {selectedEvent && (
          <div 
            key={rippleKey}
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: `radial-gradient(circle at ${((selectedEvent.location.lng + 180) / 360) * 100}% ${((selectedEvent.location.lat + 90) / 180) * 100}%, rgba(255, 107, 157, 0.3) 0%, transparent 50%)`,
              animation: 'ripple 0.6s ease-out'
            }}
          />
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-4">
          <div className="apple-card max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedEvent.title}
                  </h2>
                  {selectedEvent.isHot && (
                    <span className="animate-hot-badge bg-red-500 text-white text-sm px-3 py-1 rounded-full font-bold flex items-center gap-1">
                      🔥 HOT
                    </span>
                  )}
                </div>
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

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  Leaderboard
                </h2>
                <button
                  onClick={() => setShowLeaderboard(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <Leaderboard />
            </div>
          </div>
        </div>
      )}

      {/* Event Dashboard Modal */}
      {showEventDashboard && selectedEventForDashboard && (
        <EventDashboard
          event={selectedEventForDashboard}
          onClose={() => setShowEventDashboard(false)}
          user={user}
        />
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin
          onSuccess={handleAdminSuccess}
          onClose={() => setShowAdminLogin(false)}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onClick={onCreateEvent} />
    </div>
  );
}
