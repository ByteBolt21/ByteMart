// order.service.js

import Order from '../models/order.model.js';

// Function to create a new order
export const createOrderService = async (buyerId, orderData) => {
  const { products, totalAmount, shippingAddress, billingAddress } = orderData;
  try {
    const order = await Order.create({ buyer: buyerId, products, totalAmount, shippingAddress, billingAddress });
    return order;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to fetch orders for a specific buyer
export const getOrdersByBuyerIdService = async (buyerId) => {
  try {
    const orders = await Order.find({ buyer: buyerId }).populate('products.product');
    return orders;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to fetch an order by ID
export const getOrderByIdService = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('products.product');
    return order;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to update order status and tracking information
export const updateOrderStatusService = async (orderId, status, trackingId) => {
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, trackingId },
      { new: true }
    );
    return order;
  } catch (error) {
    throw new Error(error.message);
  }
};
