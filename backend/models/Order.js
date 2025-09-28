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
  items: {
    type: Array,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  orderDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Pending'
  },
  address: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Order', orderSchema);