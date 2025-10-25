import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();
    
    let db;
    try {
      ({ db } = await connectToDatabase());
    } catch (dbError) {
      console.error('MongoDB connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed. Please check MongoDB Atlas cluster status.' }, { status: 500 });
    }
    
    const users = db.collection('users');
    await users.createIndex({ email: 1 }, { unique: true });

    const existing = await users.findOne({ email });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ name, email, passwordHash, createdAt: new Date() });

    const secret = process.env.JWT_SECRET || 'fallback-secret-for-development';
    const token = jwt.sign({ userId: result.insertedId.toString() }, secret, { expiresIn: '7d' });

    return NextResponse.json({
      message: 'User registered',
      user: { id: result.insertedId.toString(), email, name },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
