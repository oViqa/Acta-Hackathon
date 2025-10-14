'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/authStore';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { CreateEventDialog } from '@/components/events/CreateEventDialog';
import { Button } from '@/components/ui/button';
import { Plus, User, Menu } from 'lucide-react';

import FunctionalMapView from '@/components/map/FunctionalMapView';

export default function Home() {
  const { user, isLoading } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);

  const handleCreateEvent = () => {
    if (!user) {
      setShowLogin(true);
    } else {
      setShowCreateEvent(true);
    }
  };

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

  return (
      <main className="relative w-full h-screen overflow-hidden">
        {/* Map - Full screen, no header */}
        <div className="w-full h-full">
          <FunctionalMapView onCreateEvent={handleCreateEvent} onLogin={() => setShowLogin(true)} user={user} />
        </div>

        {/* Dialogs */}
        <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
        <CreateEventDialog open={showCreateEvent} onOpenChange={setShowCreateEvent} />
      </main>
  );
}
