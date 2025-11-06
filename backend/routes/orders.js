const express = require('express');
const Order = require('../models/Order');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
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

router.get('/:id', authenticateToken, async (req, res) => {
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

router.post('/', authenticateToken, async (req, res) => {
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

router.patch('/:id', authenticateToken, async (req, res) => {
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
      return res.status(404).json({ message: 'Order not found', status: 'error' });
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
      return res.status(404).json({ message: 'Order not found', status: 'error'});
    }
    res.json({ message: 'Order deleted successfully', status: 'success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;

    // Find the order by `id` or `_id` and ensure it is in 'Paid' status
    let order = await Order.findOne({ id: orderId, status: 'Paid' });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or cannot be cancelled' , status: 'error'});
    }
    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({ message: 'Order cancelled successfully', order, status: 'success' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
