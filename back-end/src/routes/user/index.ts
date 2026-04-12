import { Router } from 'express';
import type { Request, Response } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { UserController } from '../../controllers/user/UserController.js';

interface AuthRequest extends Request {
  userId?: string;
  user?: {
    id: string;
    username: string;
    email: string;
  };
}

const router = Router();

router.use(authenticateToken);

router.get('/profile', (req: AuthRequest, res: Response) => {
  res.status(200).json({
    message: 'Perfil do usuário',
    user: req.user,
  });
});

router.get('/all', UserController.getAllUsers);

export default router;