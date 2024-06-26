// routes.js

import express from 'express';
import { checkout } from '../controllers/checkout.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/payment', auth(), checkout);

export default router;
