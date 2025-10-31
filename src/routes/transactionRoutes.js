import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import transactionController from '../controllers/transactionController.js';

const router = express.Router({ mergeParams: true });

// Ruta para obtener el informe de transacciones de un cliente
router.get('/', authMiddleware, transactionController.showTransactionHistory);
// Ruta para obtener el informe de transacciones de un cliente buscado
router.get('/history', authMiddleware, transactionController.searchAndShowTransactionHistory);
// Ruta para exportar el informe de transacciones a PDF
router.get('/export-pdf', authMiddleware, transactionController.exportTransactionsToPDF);
//Ruta para mostrar el formulario de transacciones y listar las transacciones existentes
router.get('/create', authMiddleware, transactionController.showTransactionForm);
//Ruta para crear una transacción
router.post('/create', authMiddleware, transactionController.createTransaction);
// Ruta para anular una transacción
router.post('/void', authMiddleware, transactionController.toggleTransactionStatus);
export default router;