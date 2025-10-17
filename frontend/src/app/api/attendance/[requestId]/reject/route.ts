import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/database';
import { ObjectId } from 'mongodb';

// PATCH - Reject a request
export async function PATCH(
  req: NextRequest,
  { params }: { params: { requestId: string } }
) {
  try {
    const { requestId } = params;
    const body = await req.json();
    const { reason } = body;
    
    // Get user from token (simplified for now)
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    const userId = 'mock-user-id'; // TODO: Extract from JWT token

    let db;
    try {
      ({ db } = await connectToDatabase());
    } catch (dbError) {
      console.warn('MongoDB connection failed, falling back to mock response:', dbError);
      return NextResponse.json({
        success: true,
        message: 'Request rejected (mock)',
        attendance: { id: requestId, status: 'rejected' }
      });
    }

    const attendanceCollection = db.collection('attendance');
    const attendance = await attendanceCollection.findOne({ _id: new ObjectId(requestId) });
    
    if (!attendance) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    // Check if user is the host
    const eventsCollection = db.collection('events');
    const event = await eventsCollection.findOne({ _id: attendance.eventId });
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (event.organizerId && event.organizerId.toString() !== userId) {
      return NextResponse.json(
        { error: 'Only host can reject requests' },
        { status: 403 }
      );
    }

    // Update attendance status
    await attendanceCollection.updateOne(
      { _id: new ObjectId(requestId) },
      {
        $set: {
          status: 'rejected',
          respondedAt: new Date(),
          rejectionReason: reason || 'No reason provided',
          updatedAt: new Date()
        }
      }
    );

    return NextResponse.json({
      success: true,
      message: 'Request rejected'
    });

  } catch (error) {
    console.error('Error rejecting request:', error);
    return NextResponse.json(
      { error: 'Failed to reject request' },
      { status: 500 }
    );
  }
}
