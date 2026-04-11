import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { RoomController } from '../controllers/chat/RoomController.js';

const router = Router();

router.use(authenticateToken); 

router.get('/', RoomController.getUserRooms);
router.get('/public', RoomController.getPublicRooms);
router.get('/direct', RoomController.getUserDirectRooms);
router.get('/group', RoomController.getUserGroupRooms);
router.post('/direct', RoomController.createDirectRoom);
router.post('/group', RoomController.createGroupRoom);

export default router;
