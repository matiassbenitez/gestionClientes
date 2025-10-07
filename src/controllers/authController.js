import userModel from './../models/userModel.js';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';


const authController = {
  showLoginForm: (req, res) => {
    res.render('login', { title: 'Login' });
  },
  showRegisterForm: (req, res) => {
    res.render('register', { title: 'Register' });
  },
  register: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', 'There were errors in your submission');
      res.redirect('/register');
      //return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
      const existingUser = await userModel.findUserByUsername(username);
      if (existingUser) {
        req.flash('error_msg', 'Username already exists');
        res.redirect('/register');
        //return res.status(400).json({ error: 'Username already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userModel.createUser({ username, password: hashedPassword });
      req.app.locals.isSetupRequired = false; // Update the flag after successful registration
      req.flash('success_msg', 'User registered successfully. You can now log in.');
      res.redirect('/login');
      //res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
      console.error('Error during registration:', error);
      req.flash('error_msg', 'Server error during registration');
      res.redirect('/register');
      //res.status(500).json({ error: 'Server error' });
    }
  },
  login: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('error_msg', 'There were errors in your submission');
      res.redirect('/login');
      //return res.status(400).json({ errors: errors.array() });
    }
    const { username, password } = req.body;
    try {
      const user = await userModel.findUserByUsername(username);
      if (!user || !(await bcrypt.compare(password, user.password))) {
          req.flash('error_msg', 'Invalid username or password');
          res.redirect('/login');
        //return res.status(401).json({ error: 'Invalid username or password' });
      }
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      req.flash('success_msg', 'Login successful');
      req.session.token = token;
      res.redirect('/');
      //res.json({ message: 'Login successful', token });
    } catch (error) {
      console.error('Error during login:', error);
      req.flash('error_msg', 'Server error during login');
      res.redirect('/login');
      //res.status(500).json({ error: 'Server error' });
    }
  }
}
export default authController;