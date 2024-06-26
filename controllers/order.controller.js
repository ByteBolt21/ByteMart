import {
  createOrderService,
  getOrdersByBuyerIdService,
  getOrderByIdService,
  updateOrderStatusService,
  deleteOrderByIdService
} from '../services/order.service.js';
import { ValidationError } from '../utils/errors.js';
import { isValidObjectId } from '../utils/validateObjectId.js';

export const createOrder = async (req, res, next) => {
  const { products, shippingAddress, billingAddress } = req.body;
  try {
    const order = await createOrderService(req.user.id, { products, shippingAddress, billingAddress });
    res.status(201).json({ message: 'Order placed successfully', order });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const orders = await getOrdersByBuyerIdService(req.user.id);
    res.json(orders);
  } catch (error) {
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
    res.json(order);
  } catch (error) {
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
    res.json(order);
  } catch (error) {
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
    res.json({ message: 'Order deleted successfully', order });
  } catch (error) {
    next(error);
  }
};
