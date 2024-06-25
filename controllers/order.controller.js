import { createOrderService, getOrdersByBuyerIdService, getOrderByIdService, updateOrderStatusService, deleteOrderByIdService } from '../services/order.service.js';

// Controller function to create a new order
export const createOrder = async (req, res) => {
  const { products, shippingAddress, billingAddress } = req.body;
  try {
    const order = await createOrderService(req.user.id, { products, shippingAddress, billingAddress });
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Controller function to get orders for a specific buyer
export const getOrders = async (req, res) => {
  try {
    const orders = await getOrdersByBuyerIdService(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller function to get an order by ID
export const getOrderById = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await getOrderByIdService(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller function to update order status and tracking information
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status, trackingId } = req.body;
  try {
    const order = await updateOrderStatusService(id, status, trackingId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const deleteOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await deleteOrderByIdService(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully', order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};