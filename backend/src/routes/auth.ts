import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getDb } from '../config/database';
import { ObjectId } from 'mongodb';

const router = express.Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

// Simple endpoints (for quick testing) - also return token for compatibility
router.post('/simple/register', async (req, res) => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    const db = getDb();
    const users = db.collection('users');

    await users.createIndex({ email: 1 }, { unique: true });

    const existing = await users.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await users.insertOne({ name, email, passwordHash, createdAt: new Date() });

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId: result.insertedId.toString() }, secret, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'User registered',
      user: { id: result.insertedId.toString(), email, name },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

router.post('/simple/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const db = getDb();
    const users = db.collection('users');

    const user = await users.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.passwordHash ?? user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId: user._id.toString() }, secret, { expiresIn: '7d' });

    return res.json({
      message: 'Login successful',
      user: { id: user._id.toString(), email: user.email, name: user.name },
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Existing JWT endpoints
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    const db = getDb();
    const users = db.collection('users');

    await users.createIndex({ email: 1 }, { unique: true });

    const existingUser = await users.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      email,
      passwordHash,
      name,
      createdAt: new Date(),
    });

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId: result.insertedId.toString() }, secret, { expiresIn: '7d' });

    res.status(201).json({
      user: {
        id: result.insertedId.toString(),
        email,
        name,
        avatarUrl: null,
      },
      token
    });
  } catch (error) {
    if ((error as any)?.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const db = getDb();
    const users = db.collection('users');

    const user = await users.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign({ userId: user._id.toString() }, secret, { expiresIn: '7d' });

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl ?? null,
      },
      token
    });
  } catch (error) {
    next(error);
  }
});

import { authenticate, AuthRequest } from '../middleware/auth';

router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const db = getDb();
    const users = db.collection('users');
    const events = db.collection('events');
    const attendances = db.collection('attendances');

    const user = await users.findOne({ _id: new ObjectId(req.userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const eventsCreated = await events.countDocuments({ organizerId: req.userId });
    const eventsJoined = await attendances.countDocuments({ userId: req.userId, status: 'APPROVED' });

    res.json({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl ?? null,
      eventsCreated,
      eventsJoined
    });
  } catch (error) {
    next(error);
  }
});

export default router;
