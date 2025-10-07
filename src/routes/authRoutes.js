import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);

export default router;