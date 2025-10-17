import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: 'user' | 'admin' | 'super_admin';
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const secret = process.env.JWT_SECRET || 'your-secret-key';
    
    const decoded = jwt.verify(token, secret) as { userId: string; userRole?: string };
    req.userId = decoded.userId;
    req.userRole = decoded.userRole as 'user' | 'admin' | 'super_admin' || 'user';
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (roles: ('user' | 'admin' | 'super_admin')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.userRole 
      });
    }
    next();
  };
};

export const requireAdmin = requireRole(['admin', 'super_admin']);
export const requireSuperAdmin = requireRole(['super_admin']);
