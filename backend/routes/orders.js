const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

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

router.get('/:id', async (req, res) => {
  try {
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

router.post('/', async (req, res) => {
  try {
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

router.patch('/:id', async (req, res) => {
  try {
    const { status } = req.body;
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

router.delete('/:id', async (req, res) => {
  try {
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
