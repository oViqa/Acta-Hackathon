import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { getUserIdFromRequest } from '@/lib/auth-helpers';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '100000';
    const status = searchParams.get('status') || 'UPCOMING';
    const limit = searchParams.get('limit') || '50';

    let db;
    try {
      ({ db } = await connectToDatabase());
    } catch (dbError) {
      console.error('MongoDB connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed. Please check MongoDB Atlas cluster status.' }, { status: 500 });
    }
    
    const eventsCol = db.collection('events');
    const attendancesCol = db.collection('attendances');

    const query: any = { status };

    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseInt(radius, 10);

      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [userLng, userLat] },
          $maxDistance: maxRadius,
        },
      };
    }

    const docs = await eventsCol
      .find(query)
      .limit(parseInt(limit, 10))
      .sort({ startTime: 1 })
      .toArray();

    const usersCol = db.collection('users');
    
    const eventsWithAttendance = await Promise.all(
      docs.map(async (event) => {
        const attendances = await attendancesCol
          .find({ eventId: event._id.toString(), status: 'APPROVED' })
          .toArray();
        
        // Get organizer data
        let organizer = null;
        if (event.organizerId) {
          const organizerUser = await usersCol.findOne({ _id: event.organizerId });
          if (organizerUser) {
            organizer = {
              id: organizerUser._id.toString(),
              name: organizerUser.name || organizerUser.displayName || organizerUser.username || 'Unknown',
              username: organizerUser.username || organizerUser.displayName || 'Unknown',
              displayName: organizerUser.displayName || organizerUser.username || 'Unknown'
            };
          }
        }
        
        return {
          ...event,
          id: event._id.toString(),
          attendeeCount: attendances.length,
          organizer,
        };
      })
    );

    return NextResponse.json({ events: eventsWithAttendance, total: eventsWithAttendance.length });
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get userId from JWT token
    const userId = getUserIdFromRequest(request);
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const eventData = await request.json();
    
    let db;
    try {
      ({ db } = await connectToDatabase());
    } catch (dbError) {
      console.error('MongoDB connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed. Please check MongoDB Atlas cluster status.' }, { status: 500 });
    }
    
    const eventsCol = db.collection('events');
    const usersCol = db.collection('users');
    
    // Get user data to include organizer info
    const user = await usersCol.findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Create event with organizerId
    const result = await eventsCol.insertOne({
      ...eventData,
      organizerId: new ObjectId(userId),
      createdAt: new Date(),
      status: 'UPCOMING'
    });

    return NextResponse.json({
      message: 'Event created',
      event: {
        id: result.insertedId.toString(),
        ...eventData,
        organizerId: userId,
        organizer: {
          id: user._id.toString(),
          name: user.name || user.displayName || user.username || 'Unknown',
          username: user.username || user.displayName || 'Unknown',
          displayName: user.displayName || user.username || 'Unknown'
        },
        createdAt: new Date().toISOString(),
        status: 'UPCOMING'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
