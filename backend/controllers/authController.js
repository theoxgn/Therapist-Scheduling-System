// backend/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

const authController = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email, isActive: true } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // Remove password from response
      const userResponse = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      };

      res.json({
        user: userResponse,
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  },
 register: async (req, res) => {
   try {
     const { name, email, password, role } = req.body;

     // Check if user exists
     const existingUser = await User.findOne({ where: { email } });
     if (existingUser) {
       return res.status(400).json({ message: 'Email already registered' });
     }

     // Hash password
     const hashedPassword = await bcrypt.hash(password, 10);

     // Create user
     const user = await User.create({
       name,
       email,
       password: hashedPassword,
       role: role || 'staff'
     });

     const userResponse = {
       id: user.id,
       name: user.name,
       email: user.email,
       role: user.role
     };

     res.status(201).json(userResponse);
   } catch (error) {
     console.error('Registration error:', error);
     res.status(500).json({ message: 'Registration failed' });
   }
 },

 // Refresh token handler
 refreshToken: async (req, res) => {
   try {
     const { refreshToken } = req.body;
     if (!refreshToken) {
       return res.status(401).json({ message: 'Refresh token required' });
     }

     // Verify refresh token
     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
     
     // Get user
     const user = await User.findByPk(decoded.userId);
     if (!user || !user.isActive) {
       return res.status(401).json({ message: 'Invalid refresh token' });
     }

     // Generate new access token
     const newToken = jwt.sign(
       { userId: user.id, role: user.role },
       process.env.JWT_SECRET,
       { expiresIn: '1d' }
     );

     res.json({ token: newToken });
   } catch (error) {
     console.error('Token refresh error:', error);
     res.status(401).json({ message: 'Invalid refresh token' });
   }
 },
 me: async (req, res) => {
   try {
     const user = await User.findByPk(req.user.userId, {
       attributes: ['id', 'name', 'email', 'role'] // Exclude password
     });

     if (!user) {
       return res.status(404).json({ message: 'User not found' });
     }

     res.json(user);
   } catch (error) {
     console.error('Get user error:', error);
     res.status(500).json({ message: 'Failed to get user information' });
   }
 },

 // Logout handler
 logout: async (req, res) => {
   try {
     // In a more complex implementation, you might want to:
     // 1. Invalidate the refresh token
     // 2. Add token to a blacklist
     // 3. Clear user sessions

     // For now, we'll just send a success response
     res.json({ message: 'Logged out successfully' });
   } catch (error) {
     console.error('Logout error:', error);
     res.status(500).json({ message: 'Logout failed' });
   }
 },

 // Optional: Update user
 updateUser: async (req, res) => {
   try {
     const { name, email, password } = req.body;
     const userId = req.user.userId;

     const user = await User.findByPk(userId);
     if (!user) {
       return res.status(404).json({ message: 'User not found' });
     }

     // Update user fields
     if (name) user.name = name;
     if (email) user.email = email;
     if (password) {
       user.password = await bcrypt.hash(password, 10);
     }

     await user.save();

     const userResponse = {
       id: user.id,
       name: user.name,
       email: user.email,
       role: user.role
     };

     res.json(userResponse);
   } catch (error) {
     console.error('Update user error:', error);
     res.status(500).json({ message: 'Failed to update user' });
   }
 }

};

module.exports = authController;