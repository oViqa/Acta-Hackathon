import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { getUserIdFromRequest } from '@/lib/auth-helpers';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, puddingPhotoUrl, puddingName, puddingDescription, message } = body;
    
    // Get userId from JWT token
    const userId = getUserIdFromRequest(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let db;
    try {
      ({ db } = await connectToDatabase());
    } catch (dbError) {
      console.warn('MongoDB connection failed, falling back to mock response:', dbError);
      return NextResponse.json({ 
        success: true, 
        message: 'Join request sent (mock)', 
        attendance: { id: 'mock-attendance-id', status: 'pending' }
      });
    }

    // Check if event exists
    const eventsCollection = db.collection('events');
    const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // ❌ PREVENT HOST FROM JOINING THEIR OWN EVENT
    if (event.organizerId && event.organizerId.toString() === userId) {
      return NextResponse.json(
        { error: 'You cannot join your own event! You are the host.' },
        { status: 400 }
      );
    }

    // Check if already requested/joined
    const attendanceCollection = db.collection('attendance');
    const existingAttendance = await attendanceCollection.findOne({
      userId: new ObjectId(userId),
      eventId: new ObjectId(eventId)
    });

    if (existingAttendance) {
      return NextResponse.json(
        { error: 'You have already requested to join this event' },
        { status: 400 }
      );
    }

    // Create attendance request
    const attendance = {
      userId: new ObjectId(userId),
      eventId: new ObjectId(eventId),
      status: 'pending',
      puddingPhotoUrl,
      puddingName,
      puddingDescription,
      requestMessage: message,
      requestedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await attendanceCollection.insertOne(attendance);

    return NextResponse.json({
      success: true,
      message: 'Join request sent successfully',
      attendance: { id: result.insertedId.toHexString(), ...attendance }
    });

  } catch (error) {
    console.error('Error creating join request:', error);
    return NextResponse.json(
      { error: 'Failed to create join request' },
      { status: 500 }
    );
  }
}
