import express from 'express';
import customerController from '../controllers/customerController.js';
import customerMiddleware from '../middlewares/customerMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import zoneMiddleware from '../middlewares/zoneMiddleware.js';
import transactionRoutes from './transactionRoutes.js';


const router = express.Router();

// Ruta para obtener todos los clientes
router.get('/', 
  authMiddleware ,
  customerController.getAllCustomers);
// Ruta para obtener un cliente por nombre
//router.get('/name/:name', authMiddleware, customerController.getCustomerByName);
//router.get('/addCustomer', authMiddleware, customerController.getAddCustomerForm);
//Ruta para modificar cliente
router.get('/update/:id', 
  authMiddleware, 
  customerMiddleware.getCustomerById, 
  zoneMiddleware.attachZones,
  customerMiddleware.setView('updateCustomer', 'Actualizar Cliente'), 
  customerController.renderView);
router.post('/update/:id', 
  authMiddleware, 
  customerController.updateCustomer);
// Ruta para agregar un nuevo cliente
router.get('/create', 
  authMiddleware, 
  zoneMiddleware.attachZones,
  customerMiddleware.setView('updateCustomer', 'Agregar Cliente'), 
  customerController.renderView);

router.post('/create', 
  authMiddleware, 
  customerController.addCustomer);
// Ruta para mostrar el formulario de búsqueda de clientes
router.get('/search', 
  authMiddleware, 
  customerController.getSearchForm);
// Ruta para enviar el formulario de búsqueda de clientes
router.post('/search', 
  authMiddleware, 
  customerMiddleware.getCustomerByName, 
  zoneMiddleware.attachZones, 
  customerMiddleware.setView('searchCustomer', 'Clientes'), 
  customerController.renderView);
// Nueva ruta para buscar cliente por ID desde el formulario
router.get('/idsearch', 
  authMiddleware, 
  customerMiddleware.getCustomerById, 
  zoneMiddleware.attachZones, 
  customerMiddleware.setView('customerDetail', 'Detalle del cliente'), 
  customerController.renderView);
  // Ruta para activar/desactivar cliente
router.get('/:id/toggleStatus', 
  authMiddleware, 
  customerController.toggleCustomerStatus);
// Ruta para obtener un cliente por ID
router.get('/:id',
  authMiddleware,
  customerMiddleware.getCustomerById, 
  zoneMiddleware.attachZones, 
  customerMiddleware.setView('customerDetail', 'Detalle del Cliente'), 
  customerController.renderView);

router.use('/:customerId/transactions', transactionRoutes);

export default router;