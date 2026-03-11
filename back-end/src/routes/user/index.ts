import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth.js';

interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

const router = Router();
router.get('/profile', authenticateToken, (req: AuthRequest, res: Response) => {
  res.status(200).json({
    message: 'Perfil do usuário',
    user: req.user,
  });
});

export default router;