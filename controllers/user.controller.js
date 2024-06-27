import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ValidationError } from '../utils/errors.js';
import { isValidObjectId } from 'mongoose';
import logger from '../utils/logger.js';

export const signup = async (req, res, next) => {
  const { fullName, username, email, role, number, password } = req.body;
  try {
    if (!fullName || !username || !email || !role || !number || !password) {
      throw new ValidationError('All fields are required');
    }
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ValidationError('Username or email already exists');
    }

    const user = new User({ fullName, username, email, role, number, password });
    await user.save();
    logger.info(`User registered successfully: ${username}`);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    if (error instanceof ValidationError) {
      return next(error);
    }
    next(error);
  }
};

export const signin = async (req, res, next) => {
  const { emailOrUsername, password } = req.body;
  try {
    const user = await User.findOne({ $or: [{ email: emailOrUsername }, { username: emailOrUsername }] });

    if (!user) {
      throw new ValidationError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ValidationError('Invalid credentials');
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    logger.info(`User signed in successfully: ${user.username}`);
    res.json({ token });
  } catch (error) {
    logger.error(`Signin error: ${error.message}`);
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    return next(new ValidationError('Invalid user ID'));
  }
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ValidationError('User not found');
    }
    logger.info(`User fetched successfully: ${user.username}`);
    res.json(user);
  } catch (error) {
    logger.error(`Get user by ID error: ${error.message}`);
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    return next(new ValidationError('Invalid user ID'));
  }
  const { fullName, username, email, number, role, isVerified } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, username, email, number, role, isVerified },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      throw new ValidationError('User not found');
    }

    logger.info(`User updated successfully: ${updatedUser.username}`);
    res.json(updatedUser);
  } catch (error) {
    logger.error(`Update user error: ${error.message}`);
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    logger.info('All users fetched successfully');
    res.json(users);
  } catch (error) {
    logger.error(`Get all users error: ${error.message}`);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    return next(new ValidationError('Invalid user ID'));
  }
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }
    logger.info(`User deleted successfully: ${user.username}`);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    logger.error(`Delete user error: ${error.message}`);
    next(error);
  }
};
