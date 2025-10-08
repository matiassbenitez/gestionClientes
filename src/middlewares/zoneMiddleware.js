import zoneModel from '../models/zoneModel.js';

const zoneMiddleware = {
  attachZones: async (req, res, next) => {
    try {
      const zones = await zoneModel.getAllZones();
      req.zones = zones; // Attach zones to the request object
      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener las zonas' });
    }
  }
};

export default zoneMiddleware;