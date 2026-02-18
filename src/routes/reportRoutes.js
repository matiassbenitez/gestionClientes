import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import transactionController from '../controllers/transactionController.js';
const router = express.Router();

//Ruta para obtener un informe anual por meses (opcional, no implementada en el controlador aún)
router.get('/report', authMiddleware, transactionController.getAnnualReport);
router.get('/report/general', authMiddleware, transactionController.getMonthlyReport);



export default router;