import Zone from '../models/zoneModel.js';

const zoneService = {
  getAllZones: async () => {
    try {
      const zones = await Zone.findAll({
        where: { is_deleted: false },
        order: [['name', 'ASC']],
        raw: true,
      });
      return zones;
    } catch (err) {
      console.error('Error fetching zones:', err);
      throw err;
    }
  },
  createZone: async (zoneData) => {
    try {
      const newZone = await Zone.create(zoneData);
      return newZone.toJSON();
    } catch (err) {
      console.error('Error creating zone:', err);
      throw err;
    }
  },
  updateZone: async (id, name) => {
    try {
      const [updatedRows] = await Zone.update(
        { name },
        { where: { id, is_deleted: false } }
      );
      return updatedRows > 0;
    } catch (err) {
      console.error('Error updating zone:', err);
      throw err;
    }
  },
  getZoneById: async (id) => {
    try {
      const zone = await Zone.findOne({
        where: { id, is_deleted: false },
        raw: true,
      });
      return zone;
    } catch (err) {
      console.error('Error fetching zone by ID:', err);
      throw err;
    }
  },
  getCustomersInZone: async (zoneId) => {
    try {
      const zoneWithCustomers = await Zone.findByPk(zoneId, {
        include: [{
          model: Customer,
          as: 'customers',
          attributes: [
            'id',
            'name',
            'address',
            'phone',
            'email',
            'is_deleted',
          ],
          where: { is_deleted: false },
        }],
        order: [[{ model: Customer, as: 'customers' }, 'name', 'ASC']],
        raw: true,
        nest: true,
      });
      return zoneWithCustomers ? zoneWithCustomers.customers : [];
    } catch (err) {
      console.error('Error fetching customers in zone:', err);
      throw err;
    }
  },
}; 

export default zoneService;
