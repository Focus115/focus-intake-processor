import { Router, Request, Response } from 'express';
import { generateToken } from '../middleware/auth';

const router = Router();

router.post('/auth/login', (req: Request, res: Response): void => {
  const { password } = req.body;

  if (!password) {
    res.status(400).json({ message: 'Password required' });
    return;
  }

  const token = generateToken(password);

  if (!token) {
    res.status(401).json({ message: 'Invalid password' });
    return;
  }

  res.json({ token });
});

// Check if auth is required (for frontend to know whether to show login)
router.get('/auth/status', (_req: Request, res: Response): void => {
  const authRequired = !!process.env.APP_PASSWORD;
  res.json({ authRequired });
});

export default router;
