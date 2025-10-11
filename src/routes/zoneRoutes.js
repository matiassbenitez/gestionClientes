import express from 'express';
import zoneController from '../controllers/zoneController.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import zoneMiddleware from '../middlewares/zoneMiddleware.js';

const router = express.Router();

// Ruta para obtener todas las zonas
router.get('/', 
  authMiddleware,
  zoneMiddleware.attachZones,
  zoneController.getAllZones);
// Ruta para obtener una zona por ID
//router.get('/:id', zoneController.getZoneById);
//Ruta para mostrar el formulario de creación de zona

router.post('/create', 
  authMiddleware,
  zoneController.createZone);
router.get('/roadmap/:id',
  authMiddleware,
  zoneController.getZoneRoadmap);
//Ruta para mostrar el formulario de actualización de zona
router.get('/update/:id', 
  authMiddleware,
  zoneMiddleware.attachZones,
  zoneController.getUpdateZoneForm);
// Ruta para actualizar una zona existente
router.post('/update/:id',
  authMiddleware,
  zoneController.updateZone);

export default router;