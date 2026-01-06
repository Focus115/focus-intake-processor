import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Simple token-based auth using HMAC
const getAuthSecret = () => process.env.AUTH_SECRET || process.env.OPENAI_API_KEY || 'default-secret';

export function generateToken(password: string): string | null {
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    console.error('APP_PASSWORD environment variable not set');
    return null;
  }

  if (password !== appPassword) {
    return null;
  }

  // Create a simple signed token with expiration
  const expiration = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  const payload = `valid:${expiration}`;
  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(payload)
    .digest('hex');

  return Buffer.from(`${payload}:${signature}`).toString('base64');
}

export function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');

    if (parts.length !== 3) return false;

    const [status, expiration, signature] = parts;
    const payload = `${status}:${expiration}`;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', getAuthSecret())
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) return false;

    // Check expiration
    if (Date.now() > parseInt(expiration, 10)) return false;

    return status === 'valid';
  } catch {
    return false;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Skip auth for login endpoint and health check
  if (req.path === '/api/auth/login' || req.path === '/api/health') {
    next();
    return;
  }

  // Skip auth if APP_PASSWORD is not set (allows running without auth in dev)
  if (!process.env.APP_PASSWORD) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const token = authHeader.substring(7);

  if (!verifyToken(token)) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }

  next();
}
