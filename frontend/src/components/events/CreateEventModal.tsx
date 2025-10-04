'use client';

import { useState } from 'react';
import { X, MapPin, Calendar, Clock, Users, FileText, Camera, Upload } from 'lucide-react';

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

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    const eventData = {
      ...formData,
      location: selectedLocation || { lat: 52.520008, lng: 13.404954 }, // Default to Berlin
      city: formData.location,
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
            <h2 className="text-2xl font-bold text-gray-900">Create New Event</h2>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Search or click on map..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">Click on the map below to set exact location</p>
            </div>

            {/* Mini Map Preview */}
            <div className="h-48 bg-gray-100 rounded-xl flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Map preview will appear here</p>
                <p className="text-xs">Click to set location</p>
              </div>
            </div>

            {/* Attendee Limit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Attendee Limit *
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="attendeeLimit"
                  value={formData.attendeeLimit}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell people what to expect at your pudding meetup..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Your Pudding Photo */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                      <img
                        src={URL.createObjectURL(formData.puddingPhoto)}
                        alt="Pudding preview"
                        className="w-20 h-20 mx-auto rounded-lg object-cover"
                      />
                      <p className="text-sm text-gray-600">{formData.puddingPhoto.name}</p>
                      <p className="text-xs text-gray-500">Click to change</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Camera className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="text-sm text-gray-600">Upload a photo of your pudding</p>
                      <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
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
