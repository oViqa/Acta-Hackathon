import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/database';
import { ObjectId } from 'mongodb';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let db;
    try {
      ({ db } = await connectToDatabase());
    } catch (dbError) {
      console.warn('MongoDB connection failed, falling back to mock user:', dbError);
      // Return mock user data when DB is unavailable
      return NextResponse.json({
        id: userId,
        name: 'Mock User',
        email: 'user@example.com',
        role: 'user'
      });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role || 'user'
    });
  } catch (error) {
    console.error('Error in /auth/me:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
