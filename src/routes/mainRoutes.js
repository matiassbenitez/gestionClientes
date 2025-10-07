import express from 'express';
import mainController from '../controllers/mainController.js';

const router = express.Router();
// Ruta para la página de inicio
router.get('/', mainController.getHomePage);

export default router;

