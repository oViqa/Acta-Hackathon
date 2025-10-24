import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    let db;
    try {
      ({ db } = await connectToDatabase());
    } catch (dbError) {
      console.error('MongoDB connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed. Please check MongoDB Atlas cluster status.' }, { status: 500 });
    }
    
    const users = db.collection('users');
    const user = await users.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash ?? user.password);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    const token = jwt.sign({ 
      userId: user._id.toString(), 
      userRole: user.role || 'user' 
    }, secret, { expiresIn: '7d' });

    return NextResponse.json({
      message: 'Login successful',
      user: { 
        id: user._id.toString(), 
        email: user.email, 
        name: user.name,
        role: user.role || 'user'
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
