<<<<<<< HEAD
import express from 'express';
import setupController from '../controllers/setupController.js';


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

router.get('/setup', setupController.getSetup);
router.post('/setup', setupController.setup);

=======
import express from 'express';
import setupController from '../controllers/setupController.js';


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

router.get('/setup', setupController.getSetup);
router.post('/setup', setupController.setup);

>>>>>>> 30106938222b6e29ea7510cba6c54322ea4978b4
export default router;