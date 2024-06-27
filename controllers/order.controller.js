import {
  createOrderService,
  getOrdersByBuyerIdService,
  getOrderByIdService,
  updateOrderStatusService,
  deleteOrderByIdService
} from '../services/order.service.js';
import { ValidationError } from '../utils/errors.js';
import { isValidObjectId } from '../utils/validateObjectId.js';
import logger from '../utils/logger.js';

export const createOrder = async (req, res, next) => {
  const { products, shippingAddress, billingAddress } = req.body;
  try {
    const order = await createOrderService(req.user.id, { products, shippingAddress, billingAddress });
    logger.info(`Order placed successfully: Order ID ${order._id}, User ID ${req.user.id}`);
   
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    logger.error(`Failed to create order: ${error.message}`);
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await getOrdersByBuyerIdService(req.user.id);
    logger.info(`Orders fetched successfully for user ${req.user.id}`);
    res.json(orders);
  } catch (error) {
    logger.error(`Failed to fetch orders: ${error.message}`);
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new ValidationError('Invalid order ID format'));
  }
  try {
    const order = await getOrderByIdService(id);
    if (!order) {
      logger.warn(`Order not found with ID ${id}`);
      return res.status(404).json({ error: 'Order not found' });
    }
    logger.info(`Order fetched successfully: Order ID ${order._id}`);
    res.json(order);
  } catch (error) {
    logger.error(`Failed to fetch order: ${error.message}`);
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new ValidationError('Invalid order ID format'));
  }
  const { status, trackingId } = req.body;
  try {
    const order = await updateOrderStatusService(id, status, trackingId);
    logger.info(`Order status updated successfully: Order ID ${order._id}, Status ${status}`);
    res.json(order);
  } catch (error) {
    logger.error(`Failed to update order status: ${error.message}`);
    next(error);
  }
};

export const deleteOrder = async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new ValidationError('Invalid order ID format'));
  }
  try {
    const order = await deleteOrderByIdService(id);
    logger.info(`Order deleted successfully: Order ID ${order._id}`);
    res.json({ message: 'Order deleted successfully', order });
  } catch (error) {
    logger.error(`Failed to delete order: ${error.message}`);
    next(error);
  }
};