const express = require('express');
const User = require('../models/User');
const { body, param, validationResult } = require('express-validator');
const { generateToken, generateRefreshToken, authenticateToken } = require('../middleware/auth');
const router = express.Router();
const bcrypt = require('bcrypt');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Phone number must be 10 digits and start with 6, 7, 8, or 9')
    .isNumeric()
    .withMessage('Phone number must contain only numbers'),
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

const validateEmailParam = [
  param('email')
    .isEmail()
    .withMessage('Invalid email format'),
  handleValidationErrors
];

// Debug and utility routes remain unchanged
router.get('/debug/users', async (req, res) => {
  try {
    const users = await User.find().select('email name');
    res.json({ users, count: users.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authenticateToken, (req, res) => {
  try {
    res.json({ user: req.user, success: true });
  } catch (error) {
    res.status(500).json({ user: null, success: false });
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

router.get('/check/:email', validateEmailParam, async (req, res) => {
  try {
    const email = req.params.email;
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

router.get('/:id', param('id').isMongoId().withMessage('Invalid user ID format'), handleValidationErrors, async (req, res) => {
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

router.post('/register', validateUserRegistration, async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      return res.status(409).json({
        success: false,
        message: 'This email address is already registered. Please use a different email.'
      });
    }
    
    const existingPhoneUser = await User.findOne({ phone: phone });
    if (existingPhoneUser) {
      return res.status(409).json({
        success: false,
        message: 'This phone number is already registered. Please use a different phone number.'
      });
    }

    const user = new User({name,email,password,phone});
    
    const savedUser = await user.save();
    res.status(201).json({ 
      user: savedUser.toJSON(),
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

router.post('/login', validateUserLogin, async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!existingUser) {
      return res.status(401).json({ 
        message: 'Invalid email or password', 
        success: false 
      });
    }

    try {
      const user = await User.findByCredentials(email, password);
      const accessToken = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      
      const response = {
        user: user.toJSON(),
        accessToken,
        refreshToken,
        success: true,
        message: 'Login successful'
      };
      res.json(response);
    } catch (authError) {
      return res.status(401).json({ 
        message: 'Invalid email or password', 
        success: false 
      });
    }
    
  } catch (error) {
    res.status(500).json({ 
      message: 'An error occurred during login. Please try again.', 
      success: false 
    });
  }
});

router.post('/logout', (req, res) => {
  try {
    res.json({ message: 'Logged out successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Logout failed', success: false });
  }
});

// Only allow profile update via /profile for logged-in user
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, email, phone, password } = req.body;

    // Check for duplicate email
    if (email) {
      const existingEmailUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingEmailUser) {
        return res.status(409).json({
          success: false,
          message: 'This email address is already registered. Please use a different email.'
        });
      }
    }
    // Check for duplicate phone
    if (phone) {
      const existingPhoneUser = await User.findOne({ phone, _id: { $ne: userId } });
      if (existingPhoneUser) {
        return res.status(409).json({
          success: false,
          message: 'This phone number is already registered. Please use a different phone number.'
        });
      }
    }

    const updateData = { name, email, phone };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, select: '-password' }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, message: error.message || 'Profile update failed' });
  }
});

module.exports = router;
