const express = require('express');
const Order = require('../models/Order');
const { authenticateUser } = require('../middleware/auth');
const router = express.Router();

// Get all orders or filter by userId
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    let query = {};
    if (userId) {
      query.userId = userId;
    }
    const orders = await Order.find(query).sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific order by ID
router.get('/:id', async (req, res) => {
  try {
    // First try to find by custom id field, then by MongoDB _id
    let order = await Order.findOne({ id: req.params.id });
    if (!order) {
      order = await Order.findOne({ _id: req.params.id });
    }
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new order
router.post('/', async (req, res) => {
  try {
    // Generate a unique order ID
    const lastOrder = await Order.findOne().sort({ id: -1 });
    const newOrderId = lastOrder ? lastOrder.id + 1 : 1001;
    
    const orderData = {
      ...req.body,
      id: newOrderId,
      orderDate: req.body.orderDate || new Date().toISOString()
    };
    
    const order = new Order(orderData);
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update order status
router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    // First try to find by custom id field, then by MongoDB _id
    let order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status },
      { new: true, runValidators: true }
    );
    if (!order) {
      order = await Order.findOneAndUpdate(
        { _id: req.params.id },
        { status },
        { new: true, runValidators: true }
      );
    }
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete order
router.delete('/:id', async (req, res) => {
  try {
    // First try to find by custom id field, then by MongoDB _id
    let order = await Order.findOneAndDelete({ id: req.params.id });
    if (!order) {
      order = await Order.findOneAndDelete({ _id: req.params.id });
    }
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
