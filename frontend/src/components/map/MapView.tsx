'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Users, Clock, Calendar, Plus, User, Crown, Trophy, Shield, ChevronDown, LogOut, Settings } from 'lucide-react';
import JoinEventModal from '../events/JoinEventModal';
import EventChat from '../chat/EventChat';
import EventDashboard from '../events/EventDashboard';
import Leaderboard from '../leaderboard/Leaderboard';
import AdminLogin from '../admin/AdminLogin';
import AdminDashboard from '../admin/AdminDashboard';
import HostDashboard from '../host/HostDashboard';
import { MapLoadingSkeleton } from '../ui/LoadingSkeleton';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageToggle from '../ui/LanguageToggle';
import FloatingActionButton from '../ui/FloatingActionButton';
import LocationCircle from './LocationCircle';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { eventsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const [showHostDashboard, setShowHostDashboard] = useState(false);
  const [selectedEventForHost, setSelectedEventForHost] = useState<Event | null>(null);

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

  // Restore session on mount
  useEffect(() => {
    const checkSession = async () => {
      await useAuthStore.getState().checkAuth();
    };
    checkSession();
  }, []);

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
        const createdAt = e.createdAt ? new Date(e.createdAt) : new Date(Date.now() - Math.random() * 86400000);
        const isHot = false; // Disabled hot feature
        
        return {
          id: e.id || e._id,
          title: e.title,
          description: e.description,
          location: e.location?.coordinates ? 
            { lat: e.location.coordinates[1], lng: e.location.coordinates[0] } : 
            e.location?.lat && e.location?.lng ?
            { lat: e.location.lat, lng: e.location.lng } :
            { lat: 52.520008, lng: 13.404954 }, // Default to Berlin if no valid location
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
          createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
          isHot: false
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
        { 
          id: '4', 
          title: 'Chocolate Heaven', 
          location: { lat: 53.5511, lng: 9.9937 }, 
          city: 'Hamburg', 
          startTime: '2025-10-09T18:00:00Z', 
          attendeeLimit: 25, 
          attendeeCount: 18,
          createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
          isHot: false
        },
        { 
          id: '5', 
          title: 'Pudding Paradise', 
          location: { lat: 51.2277, lng: 6.7735 }, 
          city: 'Düsseldorf', 
          startTime: '2025-10-10T16:30:00Z', 
          attendeeLimit: 18, 
          attendeeCount: 10,
          createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
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

  // TODO: Re-enable when location feature is complete
  // refetch when userLocation or radius changes
  // useEffect(() => {
  //   if (userLocation) {
  //     fetchEvents({ lat: userLocation.lat, lng: userLocation.lng, radiusKm });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [JSON.stringify(userLocation), radiusKm]);

  // TODO: Re-enable when location feature is complete
  // const requestLocation = () => {
  //   if (!user) {
  //     toast({ title: 'Login required', description: 'Please login to use location-based search.' });
  //     onLogin();
  //     return;
  //   }
  //   if (!('geolocation' in navigator)) {
  //     toast({ title: 'Geolocation not supported', description: 'Your browser does not support geolocation.', variant: 'destructive' });
  //     return;
  //   }
  //   navigator.geolocation.getCurrentPosition(
  //     (pos) => {
  //       const { latitude, longitude } = pos.coords;
  //       setUserLocation({ lat: latitude, lng: longitude });
  //       toast({ title: 'Location set', description: 'Using your current location.' });
  //     },
  //     (err) => {
  //       console.error(err);
  //       toast({ title: 'Permission denied', description: 'Cannot access your location.', variant: 'destructive' });
  //     },
  //     { enableHighAccuracy: true, timeout: 10000 }
  //   );
  // };

  const handleJoinEventSubmit = async (joinData: any) => {
    try {
      const { token } = useAuthStore.getState();
      
      // Convert photo to base64
      const photoFile = joinData.puddingPhoto;
      const base64Photo = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(photoFile);
      });

      // Send join request to API
      const response = await fetch('/api/attendance/join', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId: joinData.eventId,
          puddingPhotoUrl: base64Photo,
          puddingName: joinData.puddingName,
          puddingDescription: joinData.puddingDescription,
          message: joinData.puddingDescription || `Bringing ${joinData.puddingName || 'pudding'}`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to join event');
      }

      toast({
        title: 'Request sent!',
        description: 'Your join request has been sent to the organizer.'
      });
      
      // Refresh events to show updated attendee count
      fetchEvents();
    } catch (error: any) {
      console.error('Error joining event:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send join request',
        variant: 'destructive'
      });
    }
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

  const handleOpenHostDashboard = (event: Event) => {
    // Debug logging
    console.log('Opening host dashboard for event:', event.id);
    console.log('Event organizer ID:', event.organizer?.id);
    console.log('Current user ID:', user?.id);
    console.log('Match:', event.organizer?.id === user?.id);
    
    // Extra safety check
    if (!user) {
      toast({ title: 'Authentication required', description: 'Please log in to manage events' });
      onLogin();
      return;
    }
    
    if (event.organizer?.id !== user.id) {
      toast({ title: 'Access denied', description: 'Only the event host can manage this event', variant: 'destructive' });
      return;
    }
    
    setSelectedEventForHost(event);
    setShowHostDashboard(true);
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-white text-lg sm:text-xl">🍮</span>
                </div>
                <div>
                  <h1 className="font-bold text-base sm:text-xl text-gray-900 dark:text-white">{t('app.title')}</h1>
                  <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 hidden sm:block">{t('app.subtitle')}</p>
                </div>
              </div>
              
              {/* Mobile only: Theme and Language toggles */}
              <div className="flex items-center gap-2 sm:hidden">
                <ThemeToggle />
                <LanguageToggle />
              </div>
            </div>
            
            {/* Right controls: create/login */}
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap justify-center">
              {/* TODO: Re-enable radius selector when location feature is complete */}
              {/* <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(parseInt(e.target.value))}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm hover:border-gray-400 dark:hover:border-gray-500"
                title="Radius"
              >
                {[5,10,20,30,50].map(km => (
                  <option key={km} value={km}>{km} {t('radius.km')}</option>
                ))}
              </select> */}

              {/* TODO: Re-enable location feature when complete */}
              {/* <button
                onClick={requestLocation}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hover:scale-105 active:scale-95"
                title={t('use.location')}
              >
                {t('use.location')}
              </button> */}

              <button
                onClick={() => setShowLeaderboard(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shadow-sm transition-colors hover:scale-105 active:scale-95"
                title="View leaderboard"
              >
                <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">🏆</span>
              </button>

              <button
                onClick={onCreateEvent}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm flex items-center gap-1 sm:gap-2 shadow-sm transition-colors hover:scale-105 active:scale-95"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">{t('create.event')}</span>
                <span className="xs:hidden">Create</span>
              </button>

              {/* TODO: Re-enable admin button when needed */}
              {/* <button
                onClick={() => setShowAdminLogin(true)}
                className="px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:scale-105 active:scale-95"
                title="Admin access"
              >
                <Shield className="w-4 h-4" />
              </button> */}

              {/* Desktop only: Theme and Language toggles */}
              <div className="hidden sm:flex items-center gap-2 sm:gap-3">
                <ThemeToggle />
                <LanguageToggle />
              </div>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 transition-colors hover:scale-105 active:scale-95">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-300" />
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden sm:inline">{user.name}</span>
                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 sm:hidden">{user.name.split(' ')[0]}</span>
                      <ChevronDown className="w-3 h-3 text-gray-500" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-white border-orange-200">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-gray-900">{user.name}</p>
                        <p className="text-xs leading-none text-gray-500">{user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-orange-100" />
                    <DropdownMenuItem 
                      className="cursor-pointer text-orange-600 hover:bg-orange-50 focus:bg-orange-50 focus:text-orange-600"
                      onClick={() => useAuthStore.getState().logout()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <button
                  onClick={onLogin}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors hover:scale-105 active:scale-95"
                >
                  {t('login')}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Map View */}
      <div className="h-full w-full pt-20 sm:pt-16 relative">
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

          {/* TODO: Re-enable location features when complete */}
          {/* Location Circle - shows search radius */}
          {/* {userLocation && (
            <LocationCircle 
              center={[userLocation.lat, userLocation.lng]} 
              radius={radiusKm * 1000} 
              color="#ff6b9d"
            />
          )} */}

          {/* {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]} icon={meIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )} */}

          {events.filter(event => 
            event.location && 
            typeof event.location.lat === 'number' && 
            typeof event.location.lng === 'number' &&
            !isNaN(event.location.lat) && 
            !isNaN(event.location.lng)
          ).map((event) => (
            <Marker
              key={event.id}
              position={[event.location.lat, event.location.lng]}
              icon={puddingIcon}
              eventHandlers={{ 
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  handleMarkerClick(event);
                }
              }}
            >
              <Popup className="custom-popup" autoPan={false}>
                <div className="p-4 min-w-[280px]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">{event.title}</h3>
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
                        onClick={() => handleOpenHostDashboard(event)}
                        className="bg-blue-500 hover:bg-blue-600 text-white flex-1 text-sm py-2 rounded-lg transition-colors hover:scale-105 active:scale-95"
                      >
                        👑 Manage Event
                      </button>
                    ) : (
                      <button 
                        onClick={() => { 
                          if (!user) {
                            onLogin();
                            return;
                          }
                          setSelectedEventForJoin(event); 
                          setIsJoinEventModalOpen(true); 
                        }}
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

      {/* Host Dashboard */}
      {selectedEventForHost && (
        <HostDashboard
          eventId={selectedEventForHost.id}
          onClose={() => {
            setShowHostDashboard(false);
            setSelectedEventForHost(null);
          }}
        />
      )}

      {/* Floating Action Button */}
      <FloatingActionButton onClick={onCreateEvent} />
    </div>
  );
}
