const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  }
});

// Pre-save middleware to hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12 (higher is more secure but slower)
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Static method to find user by email and verify password
userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    throw new Error('Unable to login - invalid credentials');
  }
  
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Unable to login - invalid credentials');
  }
  
  return user;
};

// Remove password from JSON output and add id field
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  user.id = user._id;
  return user;
};

module.exports = mongoose.model('User', userSchema);
