import express from 'express';
import { z } from 'zod';
import { getDb } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ObjectId } from 'mongodb';

const router = express.Router();

const createMessageSchema = z.object({
  content: z.string().min(1).max(500),
  imageUrl: z.string().optional()
});

router.get('/events/:eventId/messages', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { eventId } = req.params as any;
    const { limit = '50', before } = req.query as any;

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    const events = db.collection('events');
    const attendances = db.collection('attendances');
    const messages = db.collection('messages');

    const ev = await events.findOne({ _id: new ObjectId(eventId) });
    if (!ev) return res.status(404).json({ error: 'Event not found' });

    const isOrganizer = ev.organizerId === req.userId;

    if (!isOrganizer) {
      const attendance = await attendances.findOne({ userId: req.userId!, eventId });
      if (!attendance || attendance.status !== 'APPROVED') {
        return res.status(403).json({ error: 'Not authorized to view messages' });
      }
    }

    const query: any = { eventId };
    if (before) query._id = { $lt: new ObjectId(before) };

    const docs = await messages
      .find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10))
      .toArray();

    res.json({ messages: docs.reverse(), hasMore: docs.length === parseInt(limit, 10) });
  } catch (error) {
    next(error);
  }
});

router.post('/events/:eventId/messages', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { eventId } = req.params as any;
    const data = createMessageSchema.parse(req.body);

    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    const events = db.collection('events');
    const attendances = db.collection('attendances');
    const messages = db.collection('messages');

    const ev = await events.findOne({ _id: new ObjectId(eventId) });
    if (!ev) return res.status(404).json({ error: 'Event not found' });

    const isOrganizer = ev.organizerId === req.userId;
    if (!isOrganizer) {
      const attendance = await attendances.findOne({ userId: req.userId!, eventId });
      if (!attendance || attendance.status !== 'APPROVED') {
        return res.status(403).json({ error: 'Not authorized to send messages' });
      }
    }

    const doc = {
      content: data.content,
      imageUrl: data.imageUrl ?? null,
      userId: req.userId!,
      eventId,
      createdAt: new Date(),
    };

    const result = await messages.insertOne(doc);
    const inserted = await messages.findOne({ _id: result.insertedId });

    res.status(201).json({ message: inserted });
  } catch (error) {
    next(error);
  }
});

export default router;
