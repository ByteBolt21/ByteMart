import express from 'express';
import { createOrder, getOrders, getOrderById, updateOrderStatus } from '../controllers/order.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', auth, createOrder);
router.get('/', auth, getOrders);
router.get('/:id', auth, getOrderById);
router.put('/:id', auth, updateOrderStatus);

export default router;