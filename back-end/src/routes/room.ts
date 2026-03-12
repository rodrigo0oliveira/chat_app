import { Router } from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { RoomController } from '../../controllers/chat/RoomController.js';

const router = Router();

router.use(authenticateToken); // protect all room routes

router.get('/', RoomController.getUserRooms);
router.post('/direct', RoomController.createDirectRoom);
router.post('/group', RoomController.createGroupRoom);

export default router;
