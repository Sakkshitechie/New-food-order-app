const express = require('express');
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const router = express.Router();

router.get('/:userId', async (req, res) => {
  try {
    const cartItems = await CartItem.find({ userId: req.params.userId });
    const transformedItems = cartItems.map(item => ({
      id: item.foodItemId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      description: item.description || ''
    }));
    res.json(transformedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:userId/add', async (req, res) => {
  try {
    const { userId } = req.params;
    const { id, name, price, image } = req.body;
    let cartItem = await CartItem.findOne({ userId, foodItemId: id });
    if (cartItem) {
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      cartItem = new CartItem({
        userId,
        foodItemId: id,
        name,
        price,
        image,
        quantity: 1
      });
      await cartItem.save();
    }
    const allCartItems = await CartItem.find({ userId });
    const transformedItems = allCartItems.map(item => ({
      id: item.foodItemId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      description: item.description || ''
    }));
    res.json(transformedItems);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.patch('/:userId/item/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    const { quantity } = req.body;
    if (quantity <= 0) {
      await CartItem.deleteOne({ userId, foodItemId: itemId });
    } else {
      await CartItem.findOneAndUpdate(
        { userId, foodItemId: itemId },
        { quantity },
        { new: true }
      );
    }
    const allCartItems = await CartItem.find({ userId });
    const transformedItems = allCartItems.map(item => ({
      id: item.foodItemId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      description: item.description || ''
    }));
    res.json(transformedItems);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:userId/item/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;

    await CartItem.deleteOne({ userId, foodItemId: itemId });
    const allCartItems = await CartItem.find({ userId });
    const transformedItems = allCartItems.map(item => ({
      id: item.foodItemId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: item.quantity,
      description: item.description || ''
    }));
    res.json(transformedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await CartItem.deleteMany({ userId });
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:userId/checkout', async (req, res) => {
  try {
    const { userId } = req.params;
    const { address } = req.body;
    
    const cartItems = await CartItem.find({ userId });
    if (cartItems.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const lastOrder = await Order.findOne().sort({ id: -1 });
    const newOrderId = lastOrder ? lastOrder.id + 1 : 1001;
    
    const orderData = {
      id: newOrderId,
      userId: userId,
      items: cartItems.map(item => ({
        id: item.foodItemId,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        description: item.description || ''
      })),
      total: total,
      orderDate: new Date().toISOString(),
      status: 'Pending',
      address: address || ''
    };
    
    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    await CartItem.deleteMany({ userId });
    
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;