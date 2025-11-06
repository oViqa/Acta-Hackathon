'use client';

import { useState } from 'react';
import { X, MapPin, Calendar, Clock, Users, FileText, Camera, Upload } from 'lucide-react';
import Image from 'next/image';
import LocationPicker from '../map/LocationPicker';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (eventData: any) => void;
}

export default function CreateEventModal({ isOpen, onClose, onSubmit }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    attendeeLimit: 15,
    puddingPhoto: null as File | null,
  });

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'attendeeLimit' ? parseInt(value) : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, puddingPhoto: file }));
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address?: string }) => {
    setSelectedLocation(location);
    // Update the location text field with the address if available
    if (location.address) {
      setFormData(prev => ({ ...prev, location: location.address! }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.date || !formData.time || !selectedLocation) {
      alert('Please fill in all required fields and select a location on the map');
      return;
    }

    // Extract city and state from location address
    const city = formData.location || selectedLocation.address || 'Unknown';
    
    // Try to extract state from address, or use a default
    let state = 'Unknown';
    if (selectedLocation.address) {
      // Try to parse state from address (typically after the last comma)
      const addressParts = selectedLocation.address.split(',').map(part => part.trim());
      if (addressParts.length >= 2) {
        state = addressParts[addressParts.length - 2] || 'Unknown';
      }
    }

    const eventData = {
      ...formData,
      location: selectedLocation,
      city,
      state,
      address: selectedLocation.address,
      startTime: new Date(`${formData.date}T${formData.time}`).toISOString(),
      endTime: new Date(`${formData.date}T${formData.time}`).toISOString(), // Add 2 hours
    };

    onSubmit(eventData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="apple-card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Event</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Event Title *
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Schoko-Pudding Sonntag"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                  Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Event Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Event Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Start typing city name..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Or click on the map below to set exact location</p>
            </div>

            {/* Interactive Map */}
            <LocationPicker 
              onLocationSelect={handleLocationSelect}
              height="300px"
            />

            {/* Attendee Limit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Attendee Limit *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="attendeeLimit"
                  value={formData.attendeeLimit}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none text-gray-900 dark:text-gray-100"
                  required
                >
                  <option value={5}>5 people</option>
                  <option value={10}>10 people</option>
                  <option value={15}>15 people</option>
                  <option value={20}>20 people</option>
                  <option value={25}>25 people</option>
                  <option value={30}>30 people</option>
                  <option value={50}>50 people</option>
                  <option value={100}>100 people</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell people what to expect at your pudding meetup..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Your Pudding Photo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Your Pudding Photo (optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  id="pudding-photo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="pudding-photo" className="cursor-pointer">
                  {formData.puddingPhoto ? (
                    <div className="space-y-2">
                      <Image
                        src={URL.createObjectURL(formData.puddingPhoto)}
                        alt="Pudding preview"
                        width={80}
                        height={80}
                        className="w-20 h-20 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formData.puddingPhoto.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600 dark:text-gray-300">Upload a photo of your pudding</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG up to 5MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 apple-button-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 apple-button-primary"
              >
                Create Event 🚀
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
