import express from 'express';
import debtController from '../controllers/debtController.js';
import debtMiddleware from '../middlewares/debtMiddleware.js';
import authMiddleware from './../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta para obtener todas las deudas
router.get('/', 
  authMiddleware,
  debtMiddleware.attachDebts,
  debtController.getAllDebts);
// Route to create a new debt entry
router.post('/create', 
  authMiddleware, 
  debtController.createDebt);

// Route to show the debt creation form
router.get('/update/:id', 
  authMiddleware, 
  debtMiddleware.attachDebts,
  debtController.getUpdateDebtForm);
// Route to update an existing debt entry
router.post('/update/:id', 
  authMiddleware, 
  debtController.updateDebt);

export default router;
