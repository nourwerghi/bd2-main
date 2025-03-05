const Order = require('../models/Order');
const { sendOrderNotification } = require('../utils/emailService');
const { sendUserNotification, broadcastNotification } = require('../utils/websocketService');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const orderData = {
      user: req.user._id,
      items: req.body.items,
      total: req.body.total,
      shippingAddress: {
        address: req.body.deliveryAddress,
        city: req.body.city,
        zip: req.body.postalCode,
        country: 'France' // Default country
      }
    };

    const order = await Order.create(orderData);
    
    // Populate user and product details for email notification
    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'username email')
      .populate('items.product', 'name price');

    // Send email notification
    await sendOrderNotification(populatedOrder);

    // Send real-time notification to admin
    broadcastNotification({
      type: 'NEW_ORDER',
      title: 'New Order Received',
      message: `New order #${order._id} received from ${req.user.username}`,
      orderId: order._id,
      createdAt: new Date()
    });

    // Send confirmation notification to user
    sendUserNotification(req.user._id, {
      type: 'ORDER_CONFIRMATION',
      title: 'Order Confirmation',
      message: `Your order #${order._id} has been received and is being processed.`,
      orderId: order._id,
      createdAt: new Date()
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
};

// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort('-createdAt');

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('user', 'username email');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Send real-time notification to user about order status update
    sendUserNotification(order.user._id, {
      type: 'ORDER_STATUS_UPDATE',
      title: 'Order Status Update',
      message: `Your order #${order._id} status has been updated to ${status}`,
      orderId: order._id,
      status: status,
      createdAt: new Date()
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'username email')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Send real-time notification to user about order status update
    sendUserNotification(order.user._id, {
      type: 'ORDER_STATUS_UPDATE',
      title: 'Order Status Update',
      message: `Your order #${order._id} status has been updated to ${status}`,
      orderId: order._id,
      status: status,
      createdAt: new Date()
    });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
};