import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

const userService = {
  createUser: async (userData) => {
    try {
      const newUser = await User.create(userData);
      const userJson = newUser.toJSON();
      delete userJson.password;
      return userJson;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },
  loginUser: async (username, password) => {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        throw new Error('User not found');
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error('Invalid password');
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      return { success: true, user: { id: user.id, username: user.username }, token };
    } catch (error) {
      console.error('Error logging in user:', error);
      throw error;
    }
  },
  countUsers: async () => {
    try {
      const userCount = await User.count();
      return userCount;
    } catch (error) {
      console.error('Error counting users:', error);
      throw error;
    }
  }
};

export default userService;