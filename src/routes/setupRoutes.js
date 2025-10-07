import express from 'express';
import setupController from '../controllers/setupController.js';


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

router.get('/setup', setupController.getSetup);
router.post('/setup', setupController.setup);

export default router;