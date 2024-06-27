// routes.js

import express from 'express';
import { cancelOrder, checkout, completeOrder } from '../controllers/checkout.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/payment', auth(), checkout);
router.get('/complete-order', auth(), completeOrder);
router.get('/cancel-order', auth(), cancelOrder);


export default router;
