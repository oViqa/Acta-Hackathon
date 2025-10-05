'use client';

import { useEffect, useState } from 'react';
import { Trophy, Crown, Star, Users, Calendar, Award } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  eventsCreated: number;
  eventsJoined: number;
  friendsCount: number;
  rank: number;
  badge?: string;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock leaderboard data
    const mockUsers: LeaderboardUser[] = [
      {
        id: '1',
        name: 'PuddingMaster',
        avatar: '🍮',
        points: 1250,
        eventsCreated: 8,
        eventsJoined: 15,
        friendsCount: 42,
        rank: 1,
        badge: '👑'
      },
      {
        id: '2',
        name: 'VanillaVibes',
        avatar: '🍦',
        points: 980,
        eventsCreated: 6,
        eventsJoined: 12,
        friendsCount: 35,
        rank: 2,
        badge: '🥇'
      },
      {
        id: '3',
        name: 'ChocoLover',
        avatar: '🍫',
        points: 850,
        eventsCreated: 5,
        eventsJoined: 18,
        friendsCount: 28,
        rank: 3,
        badge: '🥈'
      },
      {
        id: '4',
        name: 'CaramelQueen',
        avatar: '🍯',
        points: 720,
        eventsCreated: 4,
        eventsJoined: 14,
        friendsCount: 31,
        rank: 4
      },
      {
        id: '5',
        name: 'StrawberrySweet',
        avatar: '🍓',
        points: 650,
        eventsCreated: 3,
        eventsJoined: 11,
        friendsCount: 25,
        rank: 5
      }
    ];

    setTimeout(() => {
      setUsers(mockUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Trophy className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-600" />;
      default: return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-center mb-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
              <div className="w-16 h-6 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:-translate-y-1 transition-all-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Leaderboard
        </h2>
        <span className="text-sm text-gray-500">Live Rankings</span>
      </div>

      <div className="space-y-3">
        {users.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center space-x-4 p-4 rounded-lg transition-all-300 hover:scale-105 ${
              user.rank <= 3 
                ? 'bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200' 
                : 'bg-gray-50 hover:bg-gray-100'
            }`}
          >
            {/* Rank */}
            <div className="flex items-center justify-center w-8">
              {getRankIcon(user.rank)}
            </div>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
              {user.avatar || user.name.charAt(0)}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                {user.badge && <span className="text-lg">{user.badge}</span>}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {user.eventsCreated} events
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {user.friendsCount} friends
                </span>
              </div>
            </div>

            {/* Points */}
            <div className="text-right">
              <div className={`font-bold text-lg ${getRankColor(user.rank)}`}>
                {user.points.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">points</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Points earned by hosting events and making friends</span>
          <span className="flex items-center gap-1 text-orange-600 font-medium">
            <Star className="w-4 h-4" />
            Live Updates
          </span>
        </div>
      </div>
    </div>
  );
}
