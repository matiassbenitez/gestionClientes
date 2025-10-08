import zoneModel from '../models/zoneModel.js';

const zoneController = {
  getAllZones: async (req, res) => {
    try {
      const zones = req.zones;
      res.render('zones', { title: 'Zonas', zones: zones, zone: null });
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener las zonas' });
    }
  },
  createZone: async (req, res) => {
    const { name } = req.body; 
    try {
      const newZone = await zoneModel.createZone(name);
      req.flash('success_msg', 'Zona agregada exitosamente');
      res.redirect('/zones/');
    } catch (err) {
      res.status(500).json({ error: 'Error al agregar la zona' });
    }
  },
  updateZone: async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
      const success = await zoneModel.updateZone(id, name);
      if (success) {
        req.flash('success_msg', 'Zona actualizada exitosamente');
        res.redirect('/zones/');
      } else {
        res.status(404).json({ error: 'Zona no encontrada' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar la zona' });
    }
  },getZoneForm: async (req, res) => {
    const { viewTitle, zone } = req;
    res.render('zones', { title: viewTitle, zone: zone, zones:null });
  },
  getUpdateZoneForm: async (req, res) => {
    const { id } = req.params;
    try {
      const zone = await zoneModel.getZoneById(id);
      console.log("zone to update:", zone);
      if (zone) {
        req.zone = zone;
        req.viewTitle = 'Actualizar Zona';
        return zoneController.getZoneForm(req, res);
      } else {
        res.status(404).json({ error: 'Zona no encontrada' });
      }
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener la zona' });
    }
  },
};

export default zoneController;