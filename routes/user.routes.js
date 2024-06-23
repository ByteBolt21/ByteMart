import express from 'express';
const router = express.Router();

import { signup, signin, getAllUsers, getUserById, deleteUser , updateUser } from '../controllers/user.controller.js';

// Routes for user signup and signin
router.post('/signup', signup);
router.post('/signin', signin);

// Routes for getting all users and specific user by ID
router.get('/', getAllUsers);
router.get('/:userId', getUserById);

// Route for deleting a user by ID
router.put('/:userId', updateUser);
router.delete('/:userId', deleteUser);

export default router;
