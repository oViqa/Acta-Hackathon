'use client';

import { useState } from 'react';
import { X, Camera, Upload, Image, FileText } from 'lucide-react';
import NextImage from 'next/image';

interface JoinEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    city: string;
    startTime: string;
  } | null;
  onSubmit: (joinData: any) => void;
}

export default function JoinEventModal({ isOpen, onClose, event, onSubmit }: JoinEventModalProps) {
  const [formData, setFormData] = useState({
    puddingName: '',
    puddingDescription: '',
    puddingPhoto: null as File | null,
  });

  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setFormData(prev => ({ ...prev, puddingPhoto: file }));
    }
  };

  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = document.createElement('img') as HTMLImageElement;
      
      img.onload = () => {
        // Calculate new dimensions (max 800px width)
        const maxWidth = 800;
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.8);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.puddingPhoto) {
      alert('Please upload a photo of your pudding');
      return;
    }

    setIsUploading(true);

    try {
      // Compress image
      const compressedPhoto = await compressImage(formData.puddingPhoto);
      
      const joinData = {
        ...formData,
        puddingPhoto: compressedPhoto,
        eventId: event?.id,
      };

      onSubmit(joinData);
      onClose();
    } catch (error) {
      console.error('Error processing image:', error);
      alert('Error processing image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="apple-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Join Event</h2>
              <p className="text-gray-600 mt-1">{event.title}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-primary-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-primary-900 mb-2">What pudding are you bringing?</h3>
            <p className="text-sm text-primary-700">
              Upload a photo of your pudding to join this event. This helps other attendees know what to expect!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pudding Photo Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pudding Photo *
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
                <input
                  type="file"
                  id="pudding-photo"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="pudding-photo" className="cursor-pointer">
                  {formData.puddingPhoto ? (
                    <div className="space-y-3">
                      <div className="relative inline-block">
                        <NextImage
                          src={URL.createObjectURL(formData.puddingPhoto)}
                          alt="Pudding preview"
                          width={128}
                          height={128}
                          className="w-32 h-32 mx-auto rounded-xl object-cover shadow-lg"
                        />
                        <div className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{formData.puddingPhoto.name}</p>
                        <p className="text-xs text-gray-500">
                          {(formData.puddingPhoto.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <p className="text-xs text-primary-600 mt-1">Click to change</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-16 h-16 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Upload pudding photo</p>
                        <p className="text-xs text-gray-500">JPG, PNG up to 5MB</p>
                        <p className="text-xs text-primary-600 mt-1">Tap to browse</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Pudding Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pudding Name (optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="puddingName"
                  value={formData.puddingName}
                  onChange={handleInputChange}
                  placeholder="e.g., Vanilla Dream, Chocolate Delight"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {/* Pudding Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                name="puddingDescription"
                value={formData.puddingDescription}
                onChange={handleInputChange}
                placeholder="Tell us about your pudding... homemade recipe, special ingredients, etc."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Event Details */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Event Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Event:</span> {event.title}</p>
                <p><span className="font-medium">Location:</span> {event.city}</p>
                <p><span className="font-medium">Date:</span> {new Date(event.startTime).toLocaleDateString()}</p>
                <p><span className="font-medium">Time:</span> {new Date(event.startTime).toLocaleTimeString()}</p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 apple-button-secondary"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 apple-button-primary"
                disabled={isUploading || !formData.puddingPhoto}
              >
                {isUploading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Uploading...</span>
                  </div>
                ) : (
                  'Submit Request 🍮'
                )}
              </button>
            </div>
          </form>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Your request will be sent to the event organizer for approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
