const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const router = express.Router();

const formatUserResponse = (user) => {
  const userResponse = user.toObject();
  delete userResponse.password;
  userResponse.id = userResponse._id;
  return userResponse;
};

const validatePhoneNumber = (phone) => {
  if (!phone) return { valid: true, normalizedPhone: null };
  
  const normalizedPhone = phone.toString().replace(/[\s\-\(\)]/g, '').trim();
  
  const phoneRegex = /^[6-9]{1}\d{9}$/;
  
  if (!phoneRegex.test(normalizedPhone)) {
    return { 
      valid: false, 
      normalizedPhone: null,
      message: 'Phone number must be 10 digits and start with 6, 7, 8, or 9'
    };
  }
  
  return { valid: true, normalizedPhone };
};

router.get('/me', (req, res) => {
  try {
    res.json({ user: null });
  } catch (error) {
    res.status(500).json({ user: null });
  }
});

router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

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
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
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
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    
    if (!name || !normalizedEmail || !password) {
      return res.status(400).json({ 
        message: 'Name, email, and password are required',
        success: false 
      });
    }
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({
        message: phoneValidation.message,
        success: false
      });
    }
    
    if (!phone) {
      return res.status(400).json({
        message: 'Phone number is required',
        success: false
      });
    }
    const existingEmailUser = await User.findOne({ email: normalizedEmail });
    if (existingEmailUser) {
      return res.status(409).json({ 
        message: 'This email address is already registered. Please use a different email or try logging in.',
        success: false 
      });
    }
    
    if (phoneValidation.normalizedPhone) {
      const existingPhoneUser = await User.findOne({ phone: phoneValidation.normalizedPhone });
      if (existingPhoneUser) {
        return res.status(409).json({ 
          message: 'This phone number is already registered. Please use a different phone number.',
          success: false 
        });
      }
    }
    
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      phone: phoneValidation.normalizedPhone
    });
    const savedUser = await user.save();
    
    const userResponse = formatUserResponse(savedUser);
    
    res.status(201).json({ 
      user: userResponse,
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'email') {
        return res.status(409).json({ 
          message: 'This email address is already registered. Please use a different email or try logging in.',
          success: false 
        });
      } else if (field === 'phone') {
        return res.status(409).json({ 
          message: 'This phone number is already registered. Please use a different phone number.',
          success: false 
        });
      }
    }
    
    res.status(400).json({ message: error.message, success: false });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({
        message: phoneValidation.message,
        success: false
      });
    }
    const existingEmailUser = await User.findOne({ email: normalizedEmail });
    if (existingEmailUser) {
      return res.status(409).json({ 
        message: 'This email address is already registered. Please use a different email.',
        success: false 
      });
    }
    if (phoneValidation.normalizedPhone) {
      const existingPhoneUser = await User.findOne({ phone: phoneValidation.normalizedPhone });
      if (existingPhoneUser) {
        return res.status(409).json({ 
          message: 'This phone number is already registered. Please use a different phone number.',
          success: false 
        });
      }
    }
    
    const user = new User({
      name,
      email: normalizedEmail,
      password,
      phone: phoneValidation.normalizedPhone
    });
    const savedUser = await user.save();
    
    const userResponse = formatUserResponse(savedUser);
    
    res.status(201).json({ 
      user: userResponse,
      success: true,
      message: 'User created successfully'
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'email') {
        return res.status(409).json({ 
          message: 'This email address is already registered. Please use a different email.',
          success: false 
        });
      } else if (field === 'phone') {
        return res.status(409).json({ 
          message: 'This phone number is already registered. Please use a different phone number.',
          success: false 
        });
      }
    }
    
    res.status(400).json({ message: error.message, success: false });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    
    if (!normalizedEmail || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required', 
        success: false 
      });
    }
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
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID format', success: false });
    }
    
    const { name, email, phone } = req.body;
    const userId = req.params.id;
    
    const normalizedEmail = email ? email.toLowerCase().trim() : '';
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return res.status(400).json({
        message: phoneValidation.message,
        success: false
      });
    }
    if (!phone) {
      return res.status(400).json({
        message: 'Phone number is required',
        success: false
      });
    }
    if (normalizedEmail) {
      const existingEmailUser = await User.findOne({ 
        email: normalizedEmail, 
        _id: { $ne: userId } 
      });
      if (existingEmailUser) {
        return res.status(409).json({ 
          message: 'This email address is already registered by another user. Please use a different email.',
          success: false 
        });
      }
    }
    
    if (phoneValidation.normalizedPhone) {
      const existingPhoneUser = await User.findOne({ 
        phone: phoneValidation.normalizedPhone, 
        _id: { $ne: userId } 
      });
      if (existingPhoneUser) {
        return res.status(409).json({ 
          message: 'This phone number is already registered by another user. Please use a different phone number.',
          success: false 
        });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name.trim();
    if (normalizedEmail) updateData.email = normalizedEmail;
    if (phoneValidation.normalizedPhone) updateData.phone = phoneValidation.normalizedPhone;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found', success: false });
    }
    
    const userResponse = formatUserResponse(user);
    res.json({ user: userResponse, success: true, message: 'Profile updated successfully' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: `Validation error: ${validationErrors.join(', ')}`, 
        success: false 
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      if (field === 'email') {
        return res.status(409).json({ 
          message: 'This email address is already registered by another user. Please use a different email.',
          success: false 
        });
      } else if (field === 'phone') {
        return res.status(409).json({ 
          message: 'This phone number is already registered by another user. Please use a different phone number.',
          success: false 
        });
      }
      return res.status(409).json({ 
        message: 'This information is already registered by another user. Please use different details.',
        success: false 
      });
    }
    
    res.status(500).json({ message: 'Server error occurred while updating profile', success: false });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // Validate if the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }
    
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
