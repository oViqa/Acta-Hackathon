import express from 'express';
import { z } from 'zod';
import { getDb } from '../config/database';
import { isInGermany } from '../utils/geo';
import { ObjectId } from 'mongodb';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();

const createEventSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  location: z.object({ lat: z.number(), lng: z.number() }),
  city: z.string(),
  state: z.string(),
  address: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  attendeeLimit: z.number().min(5).max(100)
});

// GET /api/events?lat=&lng=&radius=&status=&limit=
router.get('/', async (req, res, next) => {
  try {
    const { lat, lng, radius = '100000', status = 'UPCOMING', limit = '50' } = req.query as any;

    const db = getDb();
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
      docs.map(async (ev) => {
        const attendeeCount = await attendancesCol.countDocuments({ eventId: ev._id.toString(), status: { $in: ['PENDING', 'APPROVED'] } });
        return {
          id: ev._id.toString(),
          title: ev.title,
          description: ev.description,
          location: { lat: ev.location?.coordinates?.[1], lng: ev.location?.coordinates?.[0] },
          city: ev.city,
          state: ev.state,
          startTime: ev.startTime,
          endTime: ev.endTime,
          attendeeLimit: ev.attendeeLimit,
          attendeeCount,
          status: ev.status ?? 'UPCOMING',
          organizer: ev.organizerId ? { id: ev.organizerId } : undefined,
        };
      })
    );

    res.json({ events: eventsWithAttendance, total: eventsWithAttendance.length });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params as any;
    const db = getDb();
    const eventsCol = db.collection('events');
    const attendancesCol = db.collection('attendances');

    const ev = await eventsCol.findOne({ _id: new ObjectId(id) });
    if (!ev) return res.status(404).json({ error: 'Event not found' });

    const approved = await attendancesCol
      .find({ eventId: id, status: 'APPROVED' })
      .project({ userId: 1, puddingPhoto: 1, puddingName: 1, status: 1 })
      .toArray();

    const attendees = approved.map((a) => ({
      id: a.userId,
      name: undefined,
      avatarUrl: undefined,
      puddingPhoto: a.puddingPhoto,
      puddingName: a.puddingName,
      status: a.status,
    }));

    res.json({
      event: {
        id: ev._id.toString(),
        title: ev.title,
        description: ev.description,
        location: { lat: ev.location?.coordinates?.[1], lng: ev.location?.coordinates?.[0] },
        city: ev.city,
        state: ev.state,
        address: ev.address,
        startTime: ev.startTime,
        endTime: ev.endTime,
        attendeeLimit: ev.attendeeLimit,
        status: ev.status ?? 'UPCOMING',
        organizer: ev.organizerId,
        attendees,
        userAttendance: null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/events
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = createEventSchema.parse(req.body);

    if (!isInGermany(data.location.lat, data.location.lng)) {
      return res.status(400).json({ error: 'Event must be located in Germany' });
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    const now = new Date();

    if (startTime <= new Date(now.getTime() + 60 * 60 * 1000)) {
      return res.status(400).json({ error: 'Event must start at least 1 hour in the future' });
    }
    if (endTime <= startTime) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    const db = getDb();
    const eventsCol = db.collection('events');

    const result = await eventsCol.insertOne({
      title: data.title,
      description: data.description,
      location: { type: 'Point', coordinates: [data.location.lng, data.location.lat] },
      city: data.city,
      state: data.state,
      address: data.address ?? null,
      startTime,
      endTime,
      attendeeLimit: data.attendeeLimit,
      organizerId: req.userId!,
      status: 'UPCOMING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const ev = await eventsCol.findOne({ _id: result.insertedId });

    res.status(201).json({ event: ev });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/events/:id
router.patch('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params as any;
    const db = getDb();
    const eventsCol = db.collection('events');

    const ev = await eventsCol.findOne({ _id: new ObjectId(id) });
    if (!ev) return res.status(404).json({ error: 'Event not found' });

    if (ev.organizerId !== req.userId) {
      return res.status(403).json({ error: 'Only organizer can edit event' });
    }

    await eventsCol.updateOne({ _id: new ObjectId(id) }, { $set: { ...req.body, updatedAt: new Date() } });
    const updated = await eventsCol.findOne({ _id: new ObjectId(id) });
    res.json({ event: updated });
  } catch (error) {
    next(error);
  }
});

// DELETE (cancel) /api/events/:id
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { id } = req.params as any;
    const db = getDb();
    const eventsCol = db.collection('events');

    const ev = await eventsCol.findOne({ _id: new ObjectId(id) });
    if (!ev) return res.status(404).json({ error: 'Event not found' });

    if (ev.organizerId !== req.userId) {
      return res.status(403).json({ error: 'Only organizer can delete event' });
    }

    await eventsCol.updateOne({ _id: new ObjectId(id) }, { $set: { status: 'CANCELLED', updatedAt: new Date() } });
    res.json({ message: 'Event cancelled successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
