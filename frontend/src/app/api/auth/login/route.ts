import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { connectToDatabase } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    let db;
    try {
      ({ db } = await connectToDatabase());
    } catch (dbError) {
      console.warn('MongoDB connection failed, falling back to mock login:', dbError);
      // Fallback to mock login if DB connection fails
      const mockUsers = [
        { email: 'admin2@puddingmeetup.com', password: 'adminpudding2', name: 'Admin User', id: 'mock-admin-id', role: 'admin' },
        { email: 'puddingdummy@puddingmeetup.com', password: 'dummytest', name: 'PuddingDummy', id: 'mock-dummy-id', role: 'user' },
        { email: 'test@example.com', password: 'testpass', name: 'Test User', id: 'mock-test-id', role: 'user' },
      ];
      const mockUser = mockUsers.find(u => u.email === email && u.password === password);
      if (mockUser) {
        const token = jwt.sign({ userId: mockUser.id, role: mockUser.role }, JWT_SECRET, { expiresIn: '1h' });
        return NextResponse.json({ message: 'Login successful (mock)', user: { id: mockUser.id, email: mockUser.email, name: mockUser.name, role: mockUser.role }, token });
      }
      return NextResponse.json({ error: 'Invalid email or password (mock)' }, { status: 401 });
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

    const secret = process.env.JWT_SECRET || 'your-secret-key';
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
