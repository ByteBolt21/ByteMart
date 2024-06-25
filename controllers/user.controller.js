import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ValidationError } from '../utils/errors.js';

export const signup = async (req, res, next) => {
  const { fullName, username, email, role, number, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      throw new ValidationError('Username or email already exists');
    }

    const user = new User({ fullName, username, email, role, number, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
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
    res.json({ token });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new ValidationError('User not found');
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  const { userId } = req.params;
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

    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw new ValidationError('User not found');
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};
