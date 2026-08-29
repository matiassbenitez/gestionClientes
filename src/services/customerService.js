import Customer from '../models/customerModel.js';
import Zone from '../models/zoneModel.js';
import sequelize from '../config/sequelize.js';
import { Op } from 'sequelize';

const getBalanceLiteral = (customerIdField = 'Customer') => sequelize.literal(`
    (
        SELECT
            COALESCE(SUM(
                CASE
                    WHEN t.type = 'Ingreso' THEN t.amount
                    WHEN t.type = 'Egreso' THEN -t.amount
                    WHEN t.type = 'Ajuste' THEN t.amount
                    ELSE 0
                END
            ), 0)
        FROM
            transactions t
        WHERE
            t.customer_id = "${customerIdField}".id AND t.is_deleted = FALSE
    )
`);

const customerService = {
  createCustomer: async (customerData) => {
    try {
      const newCustomer = await Customer.create(customerData);
      return newCustomer.toJSON();
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  },
  getAllCustomers: async () => {
    try {
      const customers = await Customer.findAll({
        include: [{
          model: Zone,
          as: 'zone',
          attributes: ['id', 'name'],
        }],
        where: { is_deleted: false },
        order: [['id', 'ASC']],
        raw: true,
        nest: true,
      });
      return customers;
    } catch (err) {
      console.error('Error fetching customers:', err);
      throw err;
    }
  },
  getCustomersInZone: async (zoneId) => {
        try {
            const customers = await Customer.findAll({
                attributes: [
                    // Seleccionamos todos los campos de Customer ('c.*')
                    ...Object.keys(Customer.getAttributes()),
                    
                    // ✅ Incorporamos el Literal para calcular el balance
                    [getBalanceLiteral('Customer'), 'balance']
                ],
                // Incluimos la Zona para el JOIN (aunque no se filtre por ella)
                include: [{
                    model: Zone,
                    as: 'zone',
                    attributes: ['name']
                }],
                where: {
                    zone_id: zoneId,           // Filtrar por la zona
                    is_deleted: false,         // Filtrar clientes no eliminados
                },
                order: [
                    // El campo 'CITY' (Ciudad) debe existir en tu modelo Customer
                    ['city', 'ASC'] 
                ],
                raw: true,
                nest: true
            });
            
            // ✅ Conversión de balance a número
            return customers.map(c => ({
                ...c,
                balance: parseFloat(c.balance) || 0
            }));

        } catch (err) {
            console.error('Error fetching customers in zone with balance:', err);
            throw err;
        }
    },
  getCustomerById: async (id) => {
    try {
      const customer = await Customer.findByPk(id, {
        include: [{
          model: Zone,
          as: 'zone',
          attributes: ['id', 'name'],
        }],
        raw: true,
        nest: true,
      });
      return customer;
    } catch (err) {
      console.error('Error fetching customer by ID:', err);
      throw err;
    }
  },
  getCustomerByName: async (name) => {
    try {
      const customers = await Customer.findAll({
        where: {
          name: {
            [Op.like]: `%${name}%`,
          },
          is_deleted: false,
        },
        raw: true,
      });
      return customers;
    } catch (err) {
      console.error('Error fetching customers by name:', err);
      throw err;
    }
  },
  updateCustomer: async (id, customerData) => {
    try {
      const [updatedRows] = await Customer.update(customerData, {
        where: { id },
      });
      return updatedRows > 0;
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  },
  toggleCustomerStatus: async (id) => {
    try {
      const customer = await Customer.findByPk(id);
      if (!customer) {
        throw new Error('Customer not found');
      }
      customer.is_deleted = !customer.is_deleted;
      await customer.save();
      return customer.toJSON();
    } catch (err) {
      console.error('Error toggling customer status:', err);
      throw err;
    }
  },
  searchCustomers: async (searchTerm) => {
    try {
      const searchPattern = `%${searchTerm}%`;
      const customers = await Customer.findAll({
        attributes: ['id', 'name'],
        where: {
          is_deleted: false,
          [Op.or]: [
            { name: { [Op.iLike]: searchPattern } },
            sequelize.where(
              sequelize.cast(sequelize.col('id'), 'varchar'),
              { [Op.like]: `${searchTerm}%` }
            ),
          ],
        },
        order: [['id', 'ASC']],
        limit: 10,
        raw: true,
      });

      return customers;
    } catch (err) {
      console.error('Error searching customers:', err);
      throw err;
    }
  },
  countCustomers: async () => {
    try {
      const count = await Customer.count({
        where: { is_deleted: false },
      });
      return count;
    } catch (err) {
      console.error('Error counting customers:', err);
      throw err;
    }
  },
};

export default customerService;