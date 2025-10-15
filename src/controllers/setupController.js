
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import flash from 'connect-flash';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

const setupController = {
//   setup: async (req, res) => {
//     const { username, password } = req.body;
//   const userCount = await userModel.countUsers();
//   if (userCount > 0) {
//     req.flash('error_msg', 'Setup can only be done once.');
//     res.redirect('/login');
//     //return res.status(400).json({ message: 'Setup can only be done once.' });
//   }
//   if (!username || !password) {
//     req.flash('error_msg', 'Username and password are required.');
//     res.redirect('/setup');
//     //return res.status(400).json({ message: 'Username and password are required.' });
//   }
//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = await userModel.createUser(username, hashedPassword);
//     req.app.locals.isSetupRequired = false; // Update the flag after successful registration
//     req.flash('success_msg', 'Admin user created successfully. You can now log in.');
//     res.redirect('/login');
//     //res.status(201).json({ message: 'Admin user created successfully.', token });
//   } catch (error) {
//     console.error('Error during setup:', error);
//     req.flash('error_msg', 'Server error during setup.');
//     res.redirect('/setup');
//     //res.status(500).json({ message: 'Internal server error.' });
//   }
// },
setup: async (req, res) => {
    // 1. Desestructurar todos los campos, incluyendo el nuevo
    const { username, password, confirm_password } = req.body; 

    // 2. Comprobar si ya se ha realizado el setup (esta lógica es correcta)
    try {
      const userCount = await userModel.countUsers();
      if (userCount > 0) {
        req.flash('error_msg', 'La configuración de administrador ya se ha realizado.');
        return res.redirect('/login');
      }
    } catch (err) {
      console.error('Error checking user count:', err);
      req.flash('error_msg', 'Error de servidor al verificar la configuración inicial.');
      return res.redirect('/setup');
    }

    // 3. Validar campos vacíos
    if (!username || !password || !confirm_password) {
      req.flash('error_msg', 'Todos los campos son obligatorios (Usuario, Contraseña y Confirmación).');
      return res.redirect('/setup');
    }
    
    // 4. NUEVA VALIDACIÓN: Verificar que las contraseñas coincidan
    if (password !== confirm_password) {
      req.flash('error_msg', 'Las contraseñas no coinciden. Por favor, verifícalas.');
      return res.redirect('/setup');
    }

    // 5. Proceder a la creación del usuario si todas las validaciones son exitosas
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await userModel.createUser(username, hashedPassword);
      
      // Asumo que req.app.locals.isSetupRequired es una variable global de la aplicación
      req.app.locals.isSetupRequired = false; 
      
      req.flash('success_msg', 'Usuario administrador creado exitosamente. Ya puedes iniciar sesión.');
      res.redirect('/login');
    } catch (error) {
      console.error('Error during setup:', error);
      req.flash('error_msg', 'Error de servidor al crear el usuario.');
      res.redirect('/setup');
    }
  },
  getSetup: async (req, res) => {
      res.render('setup', {title: 'Setup inicial'}); // Render the setup EJS view
 },
}
export default setupController