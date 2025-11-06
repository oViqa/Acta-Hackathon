'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { eventsAPI, handleApiError } from '@/lib/api';
import dynamic from 'next/dynamic';

const LocationPicker = dynamic(() => import('@/components/map/LocationPicker'), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    </div>
  )
});

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEventCreated?: () => void;
}

export function CreateEventDialog({ open, onOpenChange, onEventCreated }: CreateEventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState({ lat: 52.520008, lng: 13.404954, address: '' });
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('2');
  const [attendeeLimit, setAttendeeLimit] = useState('15');
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const { toast } = useToast();

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Geolocation not supported',
        description: 'Your browser does not support geolocation',
        variant: 'destructive',
      });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lng: longitude, address: '' });
        setGettingLocation(false);
        toast({
          title: 'Location updated',
          description: 'Map centered on your current location',
        });
      },
      (error) => {
        setGettingLocation(false);
        toast({
          title: 'Location access denied',
          description: 'Please enable location access to use this feature',
          variant: 'destructive',
        });
        console.error('Geolocation error:', error);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60 * 60 * 1000);

      // Extract city and state from location address or use coordinates
      const city = location.address || `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`;
      
      // Try to extract state from address, or use a default
      let state = 'Unknown';
      if (location.address) {
        // Try to parse state from address (typically after the last comma)
        const addressParts = location.address.split(',').map(part => part.trim());
        if (addressParts.length >= 2) {
          state = addressParts[addressParts.length - 2] || 'Unknown';
        }
      }

      const eventData = {
        title,
        description,
        location: {
          lat: location.lat,
          lng: location.lng
        },
        city,
        state,
        address: location.address,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendeeLimit: parseInt(attendeeLimit)
      };

      await eventsAPI.createEvent(eventData);

      toast({
        title: 'Event created!',
        description: 'Your pudding meetup is now live on the map.',
      });

      // Call the callback to refresh events
      if (onEventCreated) {
        onEventCreated();
      }

      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display">
            Create Pudding Meetup
          </DialogTitle>
          <DialogDescription>
            Organize a pudding gathering and watch your community grow!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="Schoko-Pudding Sonntag"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Bring your favorite pudding and let's share stories!"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Event Location *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseMyLocation}
                disabled={gettingLocation}
                className="text-xs border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600"
              >
                {gettingLocation ? (
                  <>
                    <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-1"></div>
                    Getting location...
                  </>
                ) : (
                  <>
                    📍 Use My Location
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-gray-500">Pin the exact location on the map where your event will take place</p>
            <LocationPicker
              onLocationSelect={(selectedLocation) => setLocation({
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
                address: selectedLocation.address || ''
              })}
              initialLocation={location}
              height="300px"
            />
            {location.address && (
              <p className="text-xs text-gray-600 mt-1">📍 {location.address}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Time *</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (hours) *</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="6"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="attendeeLimit">Max Attendees *</Label>
              <Input
                id="attendeeLimit"
                type="number"
                min="5"
                max="100"
                value={attendeeLimit}
                onChange={(e) => setAttendeeLimit(e.target.value)}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating...' : 'Create Event 🍮'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
