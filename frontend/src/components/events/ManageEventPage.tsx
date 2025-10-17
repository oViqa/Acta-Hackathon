import React, { useState } from 'react';
import { X, MapPin, Calendar, Clock, Users, Edit2, Trash2, Check, UserX, MessageCircle, Share2, Settings } from 'lucide-react';

export default function ManageEventPage() {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([
    { id: 1, name: 'Anna Schmidt', username: '@anna_s', avatar: '👩', bio: 'Love chocolate pudding!', requestedAt: '2 hours ago', status: 'pending' },
    { id: 2, name: 'Max Weber', username: '@maxweber', avatar: '👨', bio: 'Pudding enthusiast from Munich', requestedAt: '5 hours ago', status: 'pending' },
    { id: 3, name: 'Lisa Müller', username: '@lisamueller', avatar: '👩‍🦰', bio: 'Always up for food adventures', requestedAt: '1 day ago', status: 'pending' }
  ]);

  const [attendees, setAttendees] = useState([
    { id: 4, name: 'Sophie Klein', username: '@sophiek', avatar: '👩‍🦱', joinedAt: '3 days ago' },
    { id: 5, name: 'Leon Fischer', username: '@leonfisch', avatar: '👨‍🦲', joinedAt: '3 days ago' },
    { id: 6, name: 'Emma Wagner', username: '@emmaw', avatar: '👩‍🦳', joinedAt: '2 days ago' }
  ]);

  const [event] = useState({
    title: 'Schoko-Pudding Sonntag',
    location: 'Berlin',
    date: '10/16/2025',
    time: '10:26:13 PM',
    description: 'Join us for an amazing chocolate pudding tasting event! We\'ll be trying different recipes and sharing our favorites.',
    maxAttendees: 15,
    currentAttendees: 3
  });

  const handleApprove = (id: number) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      setRequests(requests.filter(r => r.id !== id));
      setAttendees([...attendees, { ...request, joinedAt: 'Just now' }]);
    }
  };

  const handleReject = (id: number) => {
    setRequests(requests.filter(r => r.id !== id));
  };

  const handleRemoveAttendee = (id: number) => {
    setAttendees(attendees.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl">
                🍮
              </div>
              <div>
                <h1 className="text-2xl font-bold">{event.title}</h1>
                <p className="text-orange-100 text-sm">Event Management</p>
              </div>
            </div>
            <button className="p-2 hover:bg-white/20 rounded-lg transition">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Event Info Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <MapPin className="w-4 h-4 mb-1" />
              <p className="text-xs text-orange-100">Location</p>
              <p className="font-semibold">{event.location}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Calendar className="w-4 h-4 mb-1" />
              <p className="text-xs text-orange-100">Date</p>
              <p className="font-semibold">{event.date}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Clock className="w-4 h-4 mb-1" />
              <p className="text-xs text-orange-100">Time</p>
              <p className="font-semibold">{event.time}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <Users className="w-4 h-4 mb-1" />
              <p className="text-xs text-orange-100">Attendees</p>
              <p className="font-semibold">{event.currentAttendees}/{event.maxAttendees}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Action Buttons */}
        <div className="flex gap-3 mb-6">
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200">
            <Edit2 className="w-4 h-4" />
            Edit Event
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition border border-gray-200">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg shadow hover:shadow-md transition border border-red-200 ml-auto">
            <Trash2 className="w-4 h-4" />
            Cancel Event
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'requests'
                  ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Join Requests ({requests.length})
            </button>
            <button
              onClick={() => setActiveTab('attendees')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'attendees'
                  ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Attendees ({attendees.length})
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex-1 px-6 py-4 font-semibold transition ${
                activeTab === 'details'
                  ? 'bg-orange-50 text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Event Details
            </button>
          </div>

          <div className="p-6">
            {/* Join Requests Tab */}
            {activeTab === 'requests' && (
              <div className="space-y-4">
                {requests.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No pending requests</p>
                    <p className="text-gray-400 text-sm mt-1">New join requests will appear here</p>
                  </div>
                ) : (
                  requests.map(request => (
                    <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-2xl">
                          {request.avatar}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{request.name}</h3>
                          <p className="text-sm text-gray-600">{request.username}</p>
                          <p className="text-sm text-gray-500 mt-1">{request.bio}</p>
                          <p className="text-xs text-gray-400 mt-1">Requested {request.requestedAt}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                        >
                          <Check className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          <X className="w-4 h-4" />
                          Reject
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-white rounded-lg transition">
                          <MessageCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Attendees Tab */}
            {activeTab === 'attendees' && (
              <div className="space-y-4">
                {attendees.map(attendee => (
                  <div key={attendee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                        {attendee.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{attendee.name}</h3>
                        <p className="text-sm text-gray-600">{attendee.username}</p>
                        <p className="text-xs text-gray-400 mt-1">Joined {attendee.joinedAt}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                      <button
                        onClick={() => handleRemoveAttendee(attendee.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition"
                      >
                        <UserX className="w-4 h-4" />
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Event Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Event Description</h3>
                  <p className="text-gray-700 leading-relaxed">{event.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Event Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{event.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">{event.date}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">{event.time}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Max Attendees:</span>
                        <span className="font-medium">{event.maxAttendees}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Statistics</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Attendees:</span>
                        <span className="font-medium">{event.currentAttendees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending Requests:</span>
                        <span className="font-medium">{requests.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available Spots:</span>
                        <span className="font-medium">{event.maxAttendees - event.currentAttendees}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-medium">{Math.round((event.currentAttendees / event.maxAttendees) * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Quick Actions</h4>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm">
                      Send Update to All
                    </button>
                    <button className="px-4 py-2 bg-white border border-orange-300 text-orange-700 rounded-lg hover:bg-orange-50 transition text-sm">
                      Export Attendee List
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
