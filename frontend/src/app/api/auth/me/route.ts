import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth-helpers';
import { connectToDatabase } from '@/lib/database';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

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
      console.error('MongoDB connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed. Please check MongoDB Atlas cluster status.' }, { status: 500 });
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
