import express from 'express';
import multer from 'multer';
import authMiddleware from '../../middlewares/auth.js';
import * as patientController from './controller.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/onboarding', authMiddleware, patientController.saveOnboarding);
router.get('/profile', authMiddleware, patientController.getProfile);
router.post('/reports', authMiddleware, upload.single('file'), patientController.saveReport);
router.get('/reports', authMiddleware, patientController.getReports);
router.get('/admin/profiles', authMiddleware, patientController.getAdminProfiles);
router.get('/admin/reports', authMiddleware, patientController.getAdminReports);

export default router;