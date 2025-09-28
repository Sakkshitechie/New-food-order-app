const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  foodItemId: {
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
  }
}, {
  strict: true, 
  versionKey: false
});

cartItemSchema.virtual('id').get(function() { 
  return this.foodItemId;
});

cartItemSchema.set('toJSON', { 
  virtuals: true
});

module.exports = mongoose.model('CartItem', cartItemSchema);