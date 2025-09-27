const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: false,
    enum: ['main-course', 'desserts', 'snacks', 'salads', 'soups'],
    trim: true
  }
});

module.exports = mongoose.model('items', foodItemSchema);