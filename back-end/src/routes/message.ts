import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { MessageController } from '../controllers/chat/MessageController.js';

const router = Router();

router.use(authenticateToken);

router.get('/:roomId/messages', MessageController.getRoomMessages);

export default router;
