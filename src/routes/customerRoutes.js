import express from 'express';
import customerController from '../controllers/customerController.js';
import customerMiddleware from '../middlewares/customerMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Ruta para obtener todos los clientes
router.get('/', authMiddleware ,customerController.getAllCustomers);
// Ruta para obtener un cliente por nombre
//router.get('/name/:name', authMiddleware, customerController.getCustomerByName);
//router.get('/addCustomer', authMiddleware, customerController.getAddCustomerForm);
//Ruta para modificar cliente
router.get('/update/:id', authMiddleware, customerMiddleware.getCustomerById, customerMiddleware.setView('updateCustomer', 'Actualizar Cliente'), customerController.renderView);
router.post('/update/:id', authMiddleware, customerController.updateCustomer);
// Ruta para agregar un nuevo cliente
router.get('/create', authMiddleware, customerMiddleware.setView('updateCustomer', 'Agregar Cliente'), customerController.renderView);

router.post('/create', authMiddleware, customerController.addCustomer);
// Ruta para mostrar el formulario de búsqueda de clientes
router.get('/search', authMiddleware, customerController.getSearchForm);
// Ruta para enviar el formulario de búsqueda de clientes
router.post('/search', authMiddleware, customerMiddleware.getCustomerByName, customerMiddleware.setView('searchCustomer', 'Clientes'), customerController.renderView);
// Ruta para obtener un cliente por ID
router.get('/:id',authMiddleware,customerMiddleware.getCustomerById, customerMiddleware.setView('customerDetail', 'Detalle del Cliente'), customerController.renderView);


export default router;