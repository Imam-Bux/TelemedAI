import express from 'express';
import authMiddleware, { isAdmin, isDoctor } from '../../middlewares/auth.js';
import * as doctorController from './controller.js';

const router = express.Router();

router.post('/create', authMiddleware, isAdmin, doctorController.createDoctor);
router.get('/all', authMiddleware, doctorController.getAllDoctors);
router.get('/my-profile', authMiddleware, isDoctor, doctorController.getMyProfile);
router.put('/profile', authMiddleware, isDoctor, doctorController.updateDoctorProfile);
router.post('/change-password', authMiddleware, doctorController.changePassword);

router.get('/appointments', authMiddleware, isDoctor, doctorController.getMyAppointments);
router.put('/appointments/:id/complete', authMiddleware, isDoctor, doctorController.completeAppointment);
router.get('/patient-profile/:patientId', authMiddleware, isDoctor, doctorController.getPatientProfile);
router.get('/patient-reports/:patientId', authMiddleware, isDoctor, doctorController.getPatientReports);

export default router;