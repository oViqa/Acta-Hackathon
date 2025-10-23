'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import WelcomePage from '@/components/WelcomePage';
import { Button } from '@/components/ui/button';
import { Plus, User, Menu } from 'lucide-react';

const MapView = dynamic(() => import('@/components/map/MapView'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-600">Loading pudding map...</p>
      </div>
    </div>
  )
});

export default function Home() {
  const { user, isLoading } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  const handleCreateEvent = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      setShowCreateEvent(true);
    }
  };

  const handleEventCreated = () => {
    // Force MapView to refresh by changing its key
    setMapKey(prev => prev + 1);
  };

  const handleSignIn = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
    setShowLogin(true);
  };

  const handleSkipToDemo = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcome(false);
  };

  // Check if user has seen welcome page before
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show welcome page as overlay on map
  return (
    <main className="relative w-full h-screen overflow-hidden">
      {/* Map - Always in background */}
      <div className="w-full h-full">
        <MapView key={mapKey} onCreateEvent={handleCreateEvent} onLogin={() => setShowLogin(true)} user={user} />
      </div>

      {/* Welcome Page Overlay */}
      {showWelcome && (
        <WelcomePage onSignIn={handleSignIn} onSkipToDemo={handleSkipToDemo} />
      )}

      {/* Dialogs */}
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
      <CreateEventDialog 
        open={showCreateEvent} 
        onOpenChange={setShowCreateEvent}
        onEventCreated={handleEventCreated}
      />
    </main>
  );
}
