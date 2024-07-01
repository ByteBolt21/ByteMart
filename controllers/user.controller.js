import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ValidationError } from '../utils/errors.js';
import { isValidObjectId } from 'mongoose';
import logger from '../utils/logger.js';
import { Parser } from 'json2csv';

import crypto from 'crypto';
import sendEmail from '../utils/nodemailer.js';

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
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = Date.now() + 3600000; // 1 hour

    const saveUser = await user.save();

    const verificationLink = `http://localhost:5000/api/users/verify/${verificationToken}`;
    await sendEmail(email, 'Verify Your Email', `Click this link to verify your email: ${verificationLink}`);

    logger.info(`User registered successfully: ${username}`);
    res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.', saveUser });
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


export const exportUsers = async (req, res) => {
  try {
    // Fetch user data from the database
    const users = await User.find();

    if (!users.length) {
      return res.status(404).json({ error: 'No users found' });
    }

    // Define the fields for the CSV file
    const fields = ['_id', 'fullName', 'username', 'email', 'number', 'role', 'isVerified', 'createdAt'];
    const opts = { fields };

    // Parse the data to CSV format
    const parser = new Parser(opts);
    const csvData = parser.parse(users);

    // Set headers to indicate file download
    res.header('Content-Type', 'text/csv');
    res.attachment('users.csv'); //this send the file in the client side if we open this link in browser (http://localhost:5000/api/users/export) the file automatically gets download with name of users.csv
    res.send(csvData);
    logger.info('CSV file sent successfully');
    
  } catch (error) {
    logger.error(`Error exporting users: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};


export const verifyUser = async (req, res, next) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({ verificationToken: token, verificationTokenExpires: { $gt: Date.now() } });

    if (!user) {
      throw new ValidationError('Verification token is invalid or has expired');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    logger.info(`User verified successfully: ${user.username}`);
    res.status(200).json({ message: 'User verified successfully' });
  } catch (error) {
    logger.error(`Verification error: ${error.message}`);
    next(error);
  }
};