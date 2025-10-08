<<<<<<< HEAD
import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);

=======
import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

router.get('/login', authController.showLoginForm);
router.post('/login', authController.login);

>>>>>>> 30106938222b6e29ea7510cba6c54322ea4978b4
export default router;