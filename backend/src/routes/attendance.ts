import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { getDb } from '../config/database';
import { ObjectId } from 'mongodb';

const router = express.Router();

router.post(
  '/events/:eventId/join',
  authenticate,
  upload.single('puddingPhoto'),
  async (req: AuthRequest, res, next) => {
    try {
      const { eventId } = req.params as any;
      const { puddingName, puddingDesc } = req.body as any;

      if (!req.file) {
        return res.status(400).json({ error: 'Pudding photo is required' });
      }

      const db = getDb();
      const events = db.collection('events');
      const attendances = db.collection('attendances');

      const ev = await events.findOne({ _id: new ObjectId(eventId) });
      if (!ev) return res.status(404).json({ error: 'Event not found' });

      const attendanceCount = await attendances.countDocuments({ eventId, status: { $in: ['PENDING', 'APPROVED'] } });
      if (attendanceCount >= ev.attendeeLimit) {
        return res.status(400).json({ error: 'Event is full' });
      }

      const existing = await attendances.findOne({ userId: req.userId!, eventId });
      if (existing) {
        return res.status(409).json({ error: 'Already joined this event' });
      }

      const doc = {
        userId: req.userId!,
        eventId,
        status: 'PENDING',
        joinedAt: new Date(),
        puddingPhoto: `/uploads/${req.file.filename}`,
        puddingName,
        puddingDesc,
      };

      const result = await attendances.insertOne(doc);
      return res.status(201).json({ attendance: { id: result.insertedId.toString(), ...doc } });
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/events/:eventId/attendances',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { eventId } = req.params as any;
      const db = getDb();
      const events = db.collection('events');
      const attendances = db.collection('attendances');

      const ev = await events.findOne({ _id: new ObjectId(eventId) });
      if (!ev) return res.status(404).json({ error: 'Event not found' });

      if (ev.organizerId !== req.userId) {
        return res.status(403).json({ error: 'Only organizer can view attendances' });
      }

      const list = await attendances.find({ eventId }).sort({ joinedAt: -1 }).toArray();

      const grouped = {
        pending: list.filter(a => a.status === 'PENDING'),
        approved: list.filter(a => a.status === 'APPROVED'),
        rejected: list.filter(a => a.status === 'REJECTED'),
      };

      res.json(grouped);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/events/:eventId/attendances/:attendanceId',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { eventId, attendanceId } = req.params as any;
      const { status } = req.body as any;

      const db = getDb();
      const events = db.collection('events');
      const attendances = db.collection('attendances');

      const ev = await events.findOne({ _id: new ObjectId(eventId) });
      if (!ev) return res.status(404).json({ error: 'Event not found' });

      if (ev.organizerId !== req.userId) {
        return res.status(403).json({ error: 'Only organizer can update attendance' });
      }

      const updateData: any = { status };
      if (status === 'APPROVED') updateData.approvedAt = new Date();

      await attendances.updateOne({ _id: new ObjectId(attendanceId) }, { $set: updateData });
      const updated = await attendances.findOne({ _id: new ObjectId(attendanceId) });
      res.json({ attendance: updated });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/events/:eventId/attendance',
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { eventId } = req.params as any;
      const db = getDb();
      const attendances = db.collection('attendances');

      await attendances.updateOne({ userId: req.userId!, eventId }, { $set: { status: 'LEFT' } });
      res.json({ message: 'You have left the event' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
