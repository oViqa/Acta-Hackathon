import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { getUserIdFromRequest } from '@/lib/auth-helpers';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// GET all requests for an event (HOST ONLY)
export async function GET(
  req: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const { eventId } = params;
    
    // Get userId from JWT token
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let db;
    try {
      ({ db } = await connectToDatabase());
    } catch (dbError) {
      console.warn('MongoDB connection failed, falling back to empty data:', dbError);
      // Return empty data when DB is unavailable
      return NextResponse.json({
        pendingRequests: [],
        approvedAttendees: [],
        eventCapacity: 15,
        currentAttendees: 0
      });
    }

    // Check if user is the host
    const eventsCollection = db.collection('events');
    const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId && event.organizerId.toString() !== userId) {
      return NextResponse.json(
        { error: 'Only host can view requests' },
        { status: 403 }
      );
    }

    // Get pending requests with user details
    const attendanceCollection = db.collection('attendance');
    const usersCollection = db.collection('users');
    
    const pendingRequests = await attendanceCollection.find({
      eventId: new ObjectId(eventId),
      status: 'pending'
    }).toArray();

    // Populate user data for pending requests
    const pendingWithUsers = await Promise.all(
      pendingRequests.map(async (request) => {
        const user = await usersCollection.findOne({ _id: request.userId });
        return {
          ...request,
          userId: user || { _id: request.userId, name: 'Unknown User', email: 'unknown@example.com' }
        };
      })
    );

    // Get approved attendees
    const approvedAttendees = await attendanceCollection.find({
      eventId: new ObjectId(eventId),
      status: 'approved'
    }).toArray();

    // Populate user data for approved attendees
    const approvedWithUsers = await Promise.all(
      approvedAttendees.map(async (attendance) => {
        const user = await usersCollection.findOne({ _id: attendance.userId });
        return {
          ...attendance,
          userId: user || { _id: attendance.userId, name: 'Unknown User', email: 'unknown@example.com' }
        };
      })
    );

    return NextResponse.json({
      pendingRequests: pendingWithUsers,
      approvedAttendees: approvedWithUsers,
      eventCapacity: event.attendeeLimit || 15,
      currentAttendees: approvedWithUsers.length
    });

  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
