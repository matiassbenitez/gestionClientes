import Zone from './zoneModel.js';
import Customer from './customerModel.js';
import Transaction from './transactionModel.js';

Customer.belongsTo(Zone, { foreignKey: 'zone_id', as: 'zone' });
Zone.hasMany(Customer, { foreignKey: 'zone_id' });
Transaction.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Customer.hasMany(Transaction, { foreignKey: 'customer_id' });
