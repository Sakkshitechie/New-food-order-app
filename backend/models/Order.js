const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  items: [{
    id: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    description: {
      type: String,
      required: false
    },
    category: {
      type: String,
      enum: ['main-course', 'desserts', 'snacks', 'salads', 'soups'],
      required: false
    }
  }],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  orderDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  address: {
    type: String,
    required: false
  }
});

module.exports = mongoose.model('Order', orderSchema);