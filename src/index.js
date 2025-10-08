import express from 'express';
import dotenv from 'dotenv';
import setupRoutes from './routes/setupRoutes.js';
import authRoutes from './routes/authRoutes.js';
import mainRoutes from './routes/mainRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import zoneRoutes from './routes/zoneRoutes.js';
import session from 'express-session';
import flash from 'connect-flash';
import helmet from 'helmet';

dotenv.config();
const app = express();
app.use(helmet(
  {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:3000", "ws://localhost:3000", "wss://localhost:3000"],
      }
    }
  }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); 
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
app.use('/customers',customerRoutes);
app.use('/zones',zoneRoutes);
export default app;