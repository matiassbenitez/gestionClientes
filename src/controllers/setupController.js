import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import flash from 'connect-flash';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const setupController = {
  setup: async (req, res) => {
    const { username, password } = req.body;
  const userCount = await userModel.countUsers();
  if (userCount > 0) {
    req.flash('error_msg', 'Setup can only be done once.');
    res.redirect('/login');
    //return res.status(400).json({ message: 'Setup can only be done once.' });
  }
  if (!username || !password) {
    req.flash('error_msg', 'Username and password are required.');
    res.redirect('/setup');
    //return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.createUser(username, hashedPassword);
    req.app.locals.isSetupRequired = false; // Update the flag after successful registration
    req.flash('success_msg', 'Admin user created successfully. You can now log in.');
    res.redirect('/login');
    //res.status(201).json({ message: 'Admin user created successfully.', token });
  } catch (error) {
    console.error('Error during setup:', error);
    req.flash('error_msg', 'Server error during setup.');
    res.redirect('/setup');
    //res.status(500).json({ message: 'Internal server error.' });
  }
},
  getSetup: async (req, res) => {
      res.render('setup', {title: 'Setup inicial'}); // Render the setup EJS view
 },
}
export default setupController