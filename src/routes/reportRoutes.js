import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import transactionController from '../controllers/transactionController.js';
const router = express.Router();

//Ruta para obtener un informe anual por meses (opcional, no implementada en el controlador aún)
router.get('/report/:year', authMiddleware, transactionController.getAnnualReport);


export default router;