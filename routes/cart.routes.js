import express from 'express';
import { addToCart, getCart, updateCart, removeFromCart } from '../controllers/cart.controller.js';
import  auth  from '../middlewares/auth.js';

const router = express.Router();

router.post('/add', auth(), addToCart);
router.get('/', auth(), getCart);
router.put('/update', auth(), updateCart);
router.delete('/remove', auth(), removeFromCart);

export default router;
