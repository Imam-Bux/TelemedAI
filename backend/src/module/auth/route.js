import express from 'express';
import authMiddleware from '../../middlewares/auth.js';
import * as authController from './controller.js';

const router = express.Router();

router.get('/login', (req, res) => {
    res.send('Login route');
});
router.post('/signUp', authController.signUp);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/ping', authMiddleware, authController.getPing);
router.get('/profile', authMiddleware, authController.getProfile);
router.delete('/delete', authMiddleware, authController.deleteUser);

export default router;