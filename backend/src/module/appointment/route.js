import express from 'express';
import authMiddleware, { isPatient, isAdmin } from '../../middlewares/auth.js';
import * as appointmentController from './controller.js';

const router = express.Router();

router.get('/available-slots/:doctorId', authMiddleware, appointmentController.getAvailableSlots);
router.get('/schedule/:doctorId', authMiddleware, appointmentController.getDoctorSchedule);

router.post('/book', authMiddleware, isPatient, appointmentController.bookAppointment);
router.get('/my', authMiddleware, isPatient, appointmentController.getMyAppointments);

router.get('/admin/all', authMiddleware, isAdmin, appointmentController.getAllAppointments);

export default router;