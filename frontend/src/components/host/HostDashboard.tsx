'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PendingRequestsList from './PendingRequestsList';
import AttendeesList from './AttendeesList';
import { useAuthStore } from '@/store/authStore';

interface HostDashboardProps {
  eventId: string;
  onClose: () => void;
}

export default function HostDashboard({ eventId, onClose }: HostDashboardProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const { token } = useAuthStore();

  const fetchRequests = useCallback(async () => {
    try {
      const response = await fetch(`/api/attendance/event/${eventId}/requests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    fetchRequests();
    
    // Set up real-time polling every 10 seconds
    const interval = setInterval(() => {
      fetchRequests();
    }, 10000);

    return () => clearInterval(interval);
  }, [eventId, token, fetchRequests]);

  const handleApprove = async (requestId: string) => {
    try {
      const response = await fetch(`/api/attendance/${requestId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to approve');

      // Refresh data
      await fetchRequests();
      
      // Show success message
      alert('Request approved!');
    } catch (error) {
      console.error('Error approving:', error);
      alert('Failed to approve request');
    }
  };

  const handleReject = async (requestId: string, reason?: string) => {
    try {
      const response = await fetch(`/api/attendance/${requestId}/reject`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) throw new Error('Failed to reject');

      await fetchRequests();
      alert('Request rejected');
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Failed to reject request');
    }
  };

  const handleRemove = async (attendanceId: string) => {
    try {
      const response = await fetch(`/api/attendance/${attendanceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to remove');

      await fetchRequests();
      alert('Attendee removed');
    } catch (error) {
      console.error('Error removing:', error);
      alert('Failed to remove attendee');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium text-gray-600">Loading event management...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-600">No data available</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg">Close</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Your Event 🍮</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live updates</span>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <span className="text-2xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Event Stats */}
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Event Capacity</h3>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {data.currentAttendees} / {data.eventCapacity}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {data.eventCapacity - data.currentAttendees} spots remaining
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending Requests</div>
                <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {data.pendingRequests.length}
                </div>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pending">
                Pending Requests ({data.pendingRequests.length})
              </TabsTrigger>
              <TabsTrigger value="attendees">
                Attendees ({data.approvedAttendees.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-4">
              {data.pendingRequests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No pending requests</h3>
                  <p className="text-gray-600 dark:text-gray-400">All requests have been processed!</p>
                </div>
              ) : (
                <PendingRequestsList
                  requests={data.pendingRequests}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              )}
            </TabsContent>

            <TabsContent value="attendees" className="mt-4">
              {data.approvedAttendees.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👥</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No attendees yet</h3>
                  <p className="text-gray-600 dark:text-gray-400">Approved requests will appear here.</p>
                </div>
              ) : (
                <AttendeesList
                  attendees={data.approvedAttendees}
                  onRemove={handleRemove}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
