import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus, deleteOrder } from '../controllers/order.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', auth(), createOrder);
router.get('/', auth(), getOrders);
router.get('/:id', auth(), getOrderById);
router.put('/:id', auth(), updateOrderStatus);
router.delete('/:id', auth(), deleteOrder);

export default router;