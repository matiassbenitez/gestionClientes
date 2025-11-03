import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();
const sequelize = new Sequelize(process.env.DB_URI, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    // ssl: {
    //   require: true,
    //   rejectUnauthorized: false,
    // },
    useUTC: false,
  },
  timezone: '-03:00',
});
  
export default sequelize;