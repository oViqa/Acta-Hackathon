import express from 'express';
import { z } from 'zod';
import { getDb } from '../config/database';
import { ObjectId } from 'mongodb';
import { authenticate, AuthRequest, requireAdmin, requireSuperAdmin } from '../middleware/auth';

const router = express.Router();

const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(['user', 'admin', 'super_admin'])
});

// GET /api/admin/users - List all users (admin only)
router.get('/users', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    const users = db.collection('users');
    const userList = await users.find({}, {
      projection: { passwordHash: 0, password: 0 } // Exclude passwords
    }).toArray();

    res.json({ users: userList });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/admin/users/:userId/role - Update user role (admin only)
router.patch('/users/:userId/role', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = updateUserRoleSchema.parse(req.body);
    
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    const users = db.collection('users');
    
    // Check if user exists
    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Super admin check: Only super_admin can promote to super_admin
    if (role === 'super_admin' && req.userRole !== 'super_admin') {
      return res.status(403).json({ 
        error: 'Only super administrators can promote users to super_admin role' 
      });
    }

    // Prevent users from demoting themselves
    if (userId === req.userId && role !== 'super_admin' && req.userRole === 'super_admin') {
      return res.status(403).json({ 
        error: 'Super administrators cannot demote themselves' 
      });
    }

    await users.updateOne(
      { _id: new ObjectId(userId) }, 
      { $set: { role, updatedAt: new Date() } }
    );

    res.json({ 
      message: `User role updated to ${role}`,
      user: {
        id: userId,
        email: user.email,
        name: user.name,
        role
      }
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/admin/events/:eventId - Force delete any event (admin only)
router.delete('/events/:eventId', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    const { eventId } = req.params;
    
    const db = getDb();
    if (!db) {
      return res.status(500).json({ error: 'Database not available' });
    }
    
    const events = db.collection('events');
    
    // Check if event exists
    const event = await events.findOne({ _id: new ObjectId(eventId) });
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Admin can delete any event
    await events.updateOne(
      { _id: new ObjectId(eventId) }, 
      { $set: { status: 'CANCELLED', updatedAt: new Date(), deletedBy: req.userId } }
    );

    res.json({ 
      message: 'Event force-deleted by administrator',
      eventId,
      deletedBy: 'administrator'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
