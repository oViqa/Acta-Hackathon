'use client';

import { useState, useEffect } from 'react';
import { MapPin, Users, Clock, Calendar, Plus, User, Trophy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import ThemeToggle from '../ui/ThemeToggle';
import LanguageToggle from '../ui/LanguageToggle';
import FloatingActionButton from '../ui/FloatingActionButton';

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

interface FunctionalMapViewProps {
  onCreateEvent: () => void;
  onLogin: () => void;
  user: any;
}

export default function FunctionalMapView({ onCreateEvent, onLogin, user }: FunctionalMapViewProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  // Mock data for demonstration
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setEvents([
        {
          id: '1',
          title: 'Berlin Pudding Meetup',
          description: 'Join us for some delicious pudding in the heart of Berlin!',
          location: { lat: 52.520008, lng: 13.404954 },
          city: 'Berlin',
          startTime: new Date(Date.now() + 86400000).toISOString(),
          attendeeLimit: 15,
          attendeeCount: 8,
          organizer: { id: '1', name: 'Pudding Lover' },
          isHot: true,
        },
        {
          id: '2',
          title: 'Munich Chocolate Pudding',
          description: 'Chocolate pudding enthusiasts unite!',
          location: { lat: 48.1351, lng: 11.5820 },
          city: 'Munich',
          startTime: new Date(Date.now() + 172800000).toISOString(),
          attendeeLimit: 20,
          attendeeCount: 12,
          organizer: { id: '2', name: 'Choco Master' },
          isHot: false,
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading pudding map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
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
            
            {/* Right controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => toast({ title: 'Location', description: 'Location feature coming soon!' })}
                className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors hover:scale-105 active:scale-95"
                title={t('use.location')}
              >
                {t('use.location')}
              </button>

              <button
                onClick={() => toast({ title: 'Leaderboard', description: 'Leaderboard coming soon!' })}
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

      {/* Map Area */}
      <div className="h-full w-full pt-16 relative">
        <div className="h-full w-full bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto p-8">
            <div className="text-8xl mb-6">🗺️</div>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Interactive Map</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Your pudding meetup map will be displayed here with all the delicious events!
            </p>
            
            {/* Events List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Upcoming Events</h3>
              {events.map((event) => (
                <div key={event.id} className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-600">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white">{event.title}</h4>
                      {event.isHot && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1 animate-pulse">
                          🔥 HOT
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {event.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.startTime).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(event.startTime).toLocaleTimeString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.attendeeCount}/{event.attendeeLimit}
                    </span>
                  </div>
                  
                  <div className="mt-4">
                    <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors hover:scale-105 active:scale-95">
                      Join Event 🍮
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={onCreateEvent} />
    </div>
  );
}
