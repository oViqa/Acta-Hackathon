import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'all'; // 'week' or 'all'
    const limit = parseInt(searchParams.get('limit') || '20');

    let db;
    try {
      ({ db } = await connectToDatabase());
    } catch (dbError) {
      console.warn('MongoDB connection failed, falling back to mock leaderboard:', dbError);
      // Return mock leaderboard data
      const mockUsers = [
        {
          _id: 'mock-user-1',
          name: 'PuddingMaster',
          email: 'pudding@example.com',
          points: 1250,
          eventsCreated: 8,
          eventsJoined: 15,
          rank: 1,
          badge: '👑'
        },
        {
          _id: 'mock-user-2',
          name: 'VanillaVibes',
          email: 'vanilla@example.com',
          points: 980,
          eventsCreated: 6,
          eventsJoined: 12,
          rank: 2,
          badge: '🥇'
        },
        {
          _id: 'mock-user-3',
          name: 'ChocoLover',
          email: 'choco@example.com',
          points: 850,
          eventsCreated: 5,
          eventsJoined: 18,
          rank: 3,
          badge: '🥈'
        }
      ];
      return NextResponse.json({ users: mockUsers, period, total: mockUsers.length });
    }

    const usersCollection = db.collection('users');
    const eventsCollection = db.collection('events');
    const attendanceCollection = db.collection('attendance');

    // Calculate date filter for weekly period
    const dateFilter = period === 'week' 
      ? { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
      : {};

    // Get all users
    const users = await usersCollection.find({}).toArray();

    // Calculate points for each user
    const usersWithPoints = await Promise.all(
      users.map(async (user) => {
        const userId = user._id;

        // Count events created by this user
        const eventsCreated = await eventsCollection.countDocuments({
          organizerId: userId,
          ...dateFilter
        });

        // Count events joined by this user (approved attendances)
        const eventsJoined = await attendanceCollection.countDocuments({
          userId: userId,
          status: 'approved',
          ...(period === 'week' ? { createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } : {})
        });

        // Calculate points: 50 points per event created, 10 points per event joined
        const points = (eventsCreated * 50) + (eventsJoined * 10);

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          points,
          eventsCreated,
          eventsJoined,
          friendsCount: Math.floor(Math.random() * 50) + 10, // Mock friends count
          avatar: user.avatarUrl || '🍮'
        };
      })
    );

    // Sort by points descending and add rank
    const sortedUsers = usersWithPoints
      .sort((a, b) => b.points - a.points)
      .slice(0, limit)
      .map((user, index) => ({
        ...user,
        rank: index + 1,
        badge: index === 0 ? '👑' : index === 1 ? '🥇' : index === 2 ? '🥈' : undefined
      }));

    return NextResponse.json({ 
      users: sortedUsers, 
      period, 
      total: sortedUsers.length,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
