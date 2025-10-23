import express from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import apiController from '../controllers/apiController.js';
import { Router } from 'express';

const router = express.Router();

router.get('/search', authMiddleware, apiController.searchCustomers);
router.get('/customers/:customerId/balance', authMiddleware, apiController.getCustomerBalance);
export default router;