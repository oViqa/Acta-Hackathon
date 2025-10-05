'use client';

import { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  TrendingUp, 
  Activity, 
  Settings,
  BarChart3,
  Globe,
  Shield,
  Database
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalMessages: number;
  activeUsers: number;
  eventsThisWeek: number;
  eventsThisMonth: number;
  averageEventSize: number;
  topCities: { city: string; count: number }[];
  recentActivity: { type: string; description: string; timestamp: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'events' | 'analytics'>('overview');

  useEffect(() => {
    // Mock admin data
    const mockStats: AdminStats = {
      totalUsers: 1247,
      totalEvents: 89,
      totalMessages: 2341,
      activeUsers: 156,
      eventsThisWeek: 12,
      eventsThisMonth: 47,
      averageEventSize: 8.5,
      topCities: [
        { city: 'Berlin', count: 23 },
        { city: 'Munich', count: 18 },
        { city: 'Hamburg', count: 15 },
        { city: 'Frankfurt', count: 12 },
        { city: 'Cologne', count: 9 }
      ],
      recentActivity: [
        { type: 'user', description: 'New user PuddingMaster joined', timestamp: '2 minutes ago' },
        { type: 'event', description: 'Event "Schoko-Pudding Sonntag" created', timestamp: '5 minutes ago' },
        { type: 'message', description: '15 new messages in Vanille Vibes chat', timestamp: '8 minutes ago' },
        { type: 'user', description: 'User CaramelQueen completed profile', timestamp: '12 minutes ago' },
        { type: 'event', description: 'Event "Caramel Connect" reached capacity', timestamp: '18 minutes ago' }
      ]
    };

    setTimeout(() => {
      setStats(mockStats);
      setIsLoading(false);
    }, 1500);
  }, []);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="h-6 bg-gray-300 rounded mb-4"></div>
                  <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Pudding mit Gabel Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Activity className="w-4 h-4" />
              <span>Live Updates</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all-300 hover:scale-105 ${
                  activeTab === tab.id
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-all-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalUsers.toLocaleString()}</p>
              </div>
              <Users className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +12% this month
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-all-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +{stats?.eventsThisWeek} this week
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-all-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.activeUsers}</p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +8% online now
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-all-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Messages</p>
                <p className="text-3xl font-bold text-gray-900">{stats?.totalMessages.toLocaleString()}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4 flex items-center text-sm text-green-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              +24% this week
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Cities */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-all-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Top Cities
              </h3>
              <div className="space-y-3">
                {stats?.topCities.map((city, index) => (
                  <div key={city.city} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-gray-900">{city.city}</span>
                    </div>
                    <span className="text-sm text-gray-600">{city.count} events</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-all-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {stats?.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'user' ? 'bg-blue-500' :
                      activity.type === 'event' ? 'bg-orange-500' : 'bg-purple-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-all-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
            <p className="text-gray-600">User management features coming soon...</p>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-all-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Management</h3>
            <p className="text-gray-600">Event management features coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white rounded-xl p-6 shadow-lg hover:-translate-y-1 transition-all-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics</h3>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
}
