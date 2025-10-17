'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { eventsAPI, handleApiError } from '@/lib/api';

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateEventDialog({ open, onOpenChange }: CreateEventDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [lat, setLat] = useState('52.520008');
  const [lng, setLng] = useState('13.404954');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('2');
  const [attendeeLimit, setAttendeeLimit] = useState('15');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60 * 60 * 1000);

      const eventData = {
        title,
        description,
        location: {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        },
        city,
        state,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        attendeeLimit: parseInt(attendeeLimit)
      };

      await eventsAPI.createEvent(eventData);

      toast({
        title: 'Event created!',
        description: 'Your pudding meetup is now live on the map.',
      });

      onOpenChange(false);
      window.location.reload();
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="Berlin"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="Berlin"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lat">Latitude *</Label>
              <Input
                id="lat"
                type="number"
                step="any"
                placeholder="52.520008"
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lng">Longitude *</Label>
              <Input
                id="lng"
                type="number"
                step="any"
                placeholder="13.404954"
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                required
              />
            </div>
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
