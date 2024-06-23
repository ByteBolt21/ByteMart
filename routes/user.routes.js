import express from 'express';
const router = express.Router();

import { signup, signin } from '../controllers/user.controller.js';

// Routes for user signup and signin
router.post('/signup', signup);
router.post('/signin', signin);

export default router;
