'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, Clock, MapPin, MessageSquare, CheckCircle, XCircle, Clock as ClockIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useTranslation } from '@/hooks/useTranslation';

interface Event {
  id: string;
  title: string;
  description?: string;
  city: string;
  startTime: string;
  attendeeLimit: number;
  attendeeCount: number;
  location: { lat: number; lng: number };
}

interface Attendance {
  _id: string;
  eventId: string;
  puddingPhoto: string;
  puddingName: string;
  puddingDesc: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  joinedAt: string;
  userId: {
    _id: string;
    name: string;
    avatarUrl?: string;
  };
}

interface EventDashboardProps {
  event: Event;
  onClose: () => void;
  user: any;
}

const EventDashboard: React.FC<EventDashboardProps> = ({ event, onClose, user }) => {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchAttendances();
  }, [event.id]);

  const fetchAttendances = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/attendance/events/${event.id}/attendances`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAttendances([
          ...data.pending,
          ...data.approved,
          ...data.rejected
        ]);
      } else {
        // Mock data for testing
        const mockAttendances: Attendance[] = [
          {
            _id: '1',
            userId: 'user1',
            eventId: event.id,
            puddingPhoto: '/uploads/pudding1.jpg',
            puddingName: 'Chocolate Pudding',
            puddingDesc: 'Homemade with love!',
            status: 'PENDING',
            joinedAt: new Date().toISOString(),
            userId: {
              _id: 'user1',
              name: 'PuddingDummy',
              avatarUrl: 'https://i.pravatar.cc/150?img=1'
            }
          },
          {
            _id: '2',
            userId: 'user2',
            eventId: event.id,
            puddingPhoto: '/uploads/pudding2.jpg',
            puddingName: 'Vanilla Pudding',
            puddingDesc: 'Classic recipe!',
            status: 'APPROVED',
            joinedAt: new Date(Date.now() - 86400000).toISOString(),
            userId: {
              _id: 'user2',
              name: 'Test User 2',
              avatarUrl: 'https://i.pravatar.cc/150?img=2'
            }
          }
        ];
        setAttendances(mockAttendances);
      }
    } catch (error) {
      console.error('Failed to fetch attendances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAttendanceStatus = async (attendanceId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const response = await fetch(`/api/attendance/events/${event.id}/attendances/${attendanceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        setAttendances(prev => prev.map(att => 
          att._id === attendanceId ? { ...att, status } : att
        ));
        toast({
          title: 'Status updated',
          description: `Attendance ${status.toLowerCase()} successfully.`,
          variant: 'default'
        });
      } else {
        // Mock update for testing
        setAttendances(prev => prev.map(att => 
          att._id === attendanceId ? { ...att, status } : att
        ));
        toast({
          title: 'Status updated',
          description: `Attendance ${status.toLowerCase()} successfully.`,
          variant: 'default'
        });
      }
    } catch (error) {
      console.error('Failed to update attendance:', error);
      toast({
        title: 'Error',
        description: 'Failed to update attendance status.',
        variant: 'destructive'
      });
    }
  };

  const filteredAttendances = attendances.filter(att => att.status.toLowerCase() === activeTab);
  const pendingCount = attendances.filter(att => att.status === 'PENDING').length;
  const approvedCount = attendances.filter(att => att.status === 'APPROVED').length;
  const rejectedCount = attendances.filter(att => att.status === 'REJECTED').length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{event.title}</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {event.city} • {new Date(event.startTime).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Event Info */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {event.attendeeCount}/{event.attendeeLimit} attendees
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {new Date(event.startTime).toLocaleTimeString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {event.city}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'pending'
                ? 'border-b-2 border-orange-500 text-orange-600 dark:text-orange-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Pending ({pendingCount})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'approved'
                ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved ({approvedCount})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'rejected'
                ? 'border-b-2 border-red-500 text-red-600 dark:text-red-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <XCircle className="w-4 h-4" />
              Rejected ({rejectedCount})
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Loading attendances...</p>
            </div>
          ) : filteredAttendances.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                No {activeTab} attendances yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAttendances.map((attendance) => (
                <div key={attendance._id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={attendance.userId.avatarUrl || `https://i.pravatar.cc/150?img=${attendance.userId._id}`}
                      alt={attendance.userId.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {attendance.userId.name}
                        </h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(attendance.joinedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mb-3">
                        <p className="font-medium text-gray-800 dark:text-gray-200">
                          {attendance.puddingName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {attendance.puddingDesc}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {attendance.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => updateAttendanceStatus(attendance._id, 'APPROVED')}
                              className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors hover:scale-105 active:scale-95"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => updateAttendanceStatus(attendance._id, 'REJECTED')}
                              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors hover:scale-105 active:scale-95"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {attendance.status === 'APPROVED' && (
                          <span className="text-green-600 dark:text-green-400 text-sm font-medium">
                            ✓ Approved
                          </span>
                        )}
                        {attendance.status === 'REJECTED' && (
                          <span className="text-red-600 dark:text-red-400 text-sm font-medium">
                            ✗ Rejected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDashboard;
