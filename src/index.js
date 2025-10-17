import express from 'express';
import dotenv from 'dotenv';
import setupRoutes from './routes/setupRoutes.js';
import authRoutes from './routes/authRoutes.js';
import mainRoutes from './routes/mainRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import zoneRoutes from './routes/zoneRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import session from 'express-session';
import flash from 'connect-flash';
import helmet from 'helmet';
import expressEjsLayouts from 'express-ejs-layouts';

dotenv.config();
const app = express();
app.use(helmet(
  {
    contentSecurityPolicy: {
      directives: {
        scriptSrc: ["'self'", 'https://cdn.jsdelivr.net'], 
        styleSrc: ["'self'", 'https://cdn.jsdelivr.net', "'unsafe-inline'"],
        defaultSrc: ["'self'"],
        connectSrc: ["'self'",'https://cdn.jsdelivr.net/npm/chart.umd.min.js.map', "http://localhost:3000", "ws://localhost:3000", "wss://localhost:3000", "https://cdn.jsdelivr.net"],
      }
    }
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
app.use(expressEjsLayouts);
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: true,
}));
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});
app.use('/',setupRoutes);
app.use('/',authRoutes);
app.use('/',mainRoutes);
app.use('/',reportRoutes);
app.use('/api', apiRoutes);
app.use('/customers',customerRoutes);
app.use('/zones',zoneRoutes);
app.use('/transactions', transactionRoutes);

export default app;
