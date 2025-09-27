const express = require('express');
const User = require('../models/User');
const { authenticateUser, optionalAuth } = require('../middleware/auth');
const router = express.Router();

// Helper function to format user response
const formatUserResponse = (user) => {
  const userResponse = user.toObject();
  delete userResponse.password;
  userResponse.id = userResponse._id;
  return userResponse;
};

// Get current user (authentication check)
router.get('/me', optionalAuth, (req, res) => {
  try {
    // For simplified auth, just return null for now
    res.json({ user: null });
  } catch (error) {
    res.status(500).json({ user: null });
  }
});

router.get('/', async (req, res) => {
  try {
    // For debugging - show all users (without passwords)
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Debug route to check if user exists by email
router.get('/check/:email', async (req, res) => {
  try {
    const email = req.params.email.toLowerCase().trim();
    const user = await User.findOne({ email }).select('-password');
    if (user) {
      res.json({ exists: true, user });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required',
        success: false 
      });
    }
    
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email already exists',
        success: false 
      });
    }
    
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phone
    });
    const savedUser = await user.save();
    
    const userResponse = formatUserResponse(savedUser);
    
    res.status(201).json({ 
      user: userResponse,
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    const user = new User({
      name,
      email,
      password,
      phone
    });
    const savedUser = await user.save();
    
    const userResponse = formatUserResponse(savedUser);
    
    res.status(201).json({ 
      user: userResponse,
      success: true,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    
    if (!normalizedEmail || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required', 
        success: false 
      });
    }
    
    // Find user with normalized email
    const user = await User.findOne({ email: normalizedEmail });
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password', 
        success: false 
      });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ 
        message: 'Invalid email or password', 
        success: false 
      });
    }
    
    const userResponse = formatUserResponse(user);
    
    res.json({ 
      user: userResponse,
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ message: error.message, success: false });
  }
});

router.post('/logout', (req, res) => {
  try {
    res.json({ message: 'Logged out successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', success: false });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone },
      { new: true, runValidators: true }
    ).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }
    const userResponse = formatUserResponse(user);
    res.json({ user: userResponse, success: true, message: 'Profile updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message, success: false });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
