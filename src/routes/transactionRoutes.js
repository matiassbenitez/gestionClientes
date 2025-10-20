import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import transactionController from '../controllers/transactionController.js';

const router = express.Router({ mergeParams: true });

// Ruta para obtener el informe de transacciones de un cliente
router.get('/', authMiddleware, transactionController.showTransactionHistory);
//Ruta para mostrar el formulario de transacciones y listar las transacciones existentes
router.get('/create', authMiddleware, transactionController.showTransactionForm);
//Ruta para crear una transacción
router.post('/create', authMiddleware, transactionController.createTransaction);

export default router;