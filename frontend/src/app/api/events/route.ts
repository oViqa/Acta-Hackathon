import { NextRequest, NextResponse } from 'next/server';
import { connectDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '100000';
    const status = searchParams.get('status') || 'UPCOMING';
    const limit = searchParams.get('limit') || '50';

    const db = await connectDatabase();
    
    if (!db) {
      // Return mock events when DB is not available
      const now = new Date();
      const mockEvents = [
        { 
          id: '1', 
          title: 'Schoko-Pudding Sonntag', 
          location: { lat: 52.520008, lng: 13.404954 }, 
          city: 'Berlin', 
          startTime: '2025-10-06T15:00:00Z', 
          attendeeLimit: 15, 
          attendeeCount: 8,
          createdAt: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
          isHot: true
        },
        { 
          id: '2', 
          title: 'Vanille Vibes', 
          location: { lat: 48.1351, lng: 11.5820 }, 
          city: 'Munich', 
          startTime: '2025-10-07T14:00:00Z', 
          attendeeLimit: 12, 
          attendeeCount: 5,
          createdAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          isHot: false
        },
        { 
          id: '3', 
          title: 'Caramel Connect', 
          location: { lat: 50.1109, lng: 8.6821 }, 
          city: 'Frankfurt', 
          startTime: '2025-10-08T16:00:00Z', 
          attendeeLimit: 20, 
          attendeeCount: 12,
          createdAt: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          isHot: false
        },
        { 
          id: '4', 
          title: 'Chocolate Heaven', 
          location: { lat: 53.5511, lng: 9.9937 }, 
          city: 'Hamburg', 
          startTime: '2025-10-09T18:00:00Z', 
          attendeeLimit: 25, 
          attendeeCount: 18,
          createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          isHot: false
        },
        { 
          id: '5', 
          title: 'Pudding Paradise', 
          location: { lat: 51.2277, lng: 6.7735 }, 
          city: 'Düsseldorf', 
          startTime: '2025-10-10T16:30:00Z', 
          attendeeLimit: 18, 
          attendeeCount: 10,
          createdAt: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
          isHot: false
        },
      ];
      return NextResponse.json({ events: mockEvents, total: mockEvents.length });
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

    const eventsWithAttendance = await Promise.all(
      docs.map(async (event) => {
        const attendances = await attendancesCol
          .find({ eventId: event._id.toString(), status: 'APPROVED' })
          .toArray();
        
        return {
          ...event,
          id: event._id.toString(),
          attendeeCount: attendances.length,
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
    const eventData = await request.json();
    
    const db = await connectDatabase();
    
    if (!db) {
      // Mock event creation when DB is not available
      const mockEvent = {
        id: `mock-event-${Date.now()}`,
        ...eventData,
        createdAt: new Date().toISOString(),
        status: 'UPCOMING'
      };
      
      return NextResponse.json({
        message: 'Event created (mock mode)',
        event: mockEvent
      });
    }
    
    const eventsCol = db.collection('events');
    const result = await eventsCol.insertOne({
      ...eventData,
      createdAt: new Date(),
      status: 'UPCOMING'
    });

    return NextResponse.json({
      message: 'Event created',
      event: {
        id: result.insertedId.toString(),
        ...eventData,
        createdAt: new Date().toISOString(),
        status: 'UPCOMING'
      }
    });
  } catch (error) {
    console.error('Failed to create event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
