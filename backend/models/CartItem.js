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
  category: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

cartItemSchema.virtual('id').get(function() {  //Virtual for id field
  return this.foodItemId;
});

cartItemSchema.set('toJSON', { //Virtual fields are serialised
  virtuals: true
});

module.exports = mongoose.model('CartItem', cartItemSchema);