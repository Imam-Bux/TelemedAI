import express from 'express';
import authMiddleware, { isAdmin } from '../../middlewares/auth.js';
import * as chatController from './controller.js';

const router = express.Router();

router.get('/room/:appointmentId', authMiddleware, chatController.getOrCreateRoom);
router.post('/:roomId/message', authMiddleware, chatController.sendMessage);
router.get('/my', authMiddleware, chatController.getMyRooms);

router.get('/admin/rooms', authMiddleware, isAdmin, chatController.getAdminRooms);
router.get('/admin/room/:roomId', authMiddleware, isAdmin, chatController.getAdminRoom);

export default router;
