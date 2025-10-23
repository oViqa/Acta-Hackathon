import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Simple auth check - you can make this more secure
    const { adminPassword } = await request.json();
    
    if (adminPassword !== 'puddingadmin123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let db;
    try {
      ({ db } = await connectToDatabase());
    } catch (dbError) {
      console.error('MongoDB connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // Clear all collections
    const usersCollection = db.collection('users');
    const eventsCollection = db.collection('events');
    const attendanceCollection = db.collection('attendance');

    const usersResult = await usersCollection.deleteMany({});
    const eventsResult = await eventsCollection.deleteMany({});
    const attendanceResult = await attendanceCollection.deleteMany({});

    return NextResponse.json({
      message: 'Database cleared successfully',
      deleted: {
        users: usersResult.deletedCount,
        events: eventsResult.deletedCount,
        attendance: attendanceResult.deletedCount
      }
    });

  } catch (error) {
    console.error('Failed to clear database:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

