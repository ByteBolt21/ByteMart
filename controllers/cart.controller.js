import {
  addToCartService,
  getCartService,
  updateCartService,
  removeFromCartService
} from '../services/cart.service.js';
import { ValidationError, NotFoundError, CartOperationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// Add to Cart Controller
export const addToCart = async (req, res, next) => {
  const { productId, quantity, variation } = req.body;
  if (!productId || !quantity || !variation) {
    return next(new ValidationError('Product ID, quantity, and variation are required'));
  }
  
  console.log(variation)
  try {
    const cart = await addToCartService(req.user.id, { productId, quantity, variation });
    logger.info(`Item added to cart: Product ID ${productId}, Quantity ${quantity}, User ID ${req.user.id}`);
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (error) {
    logger.error(`Failed to add item to cart: ${error.message}`);
    next(error);
  }
};


// Get Cart Controller
export const getCart = async (req, res, next) => {
  try {
    const cart = await getCartService(req.user.id);
    logger.info(`Cart fetched successfully for user ${req.user.id}`);
    res.status(200).json(cart);
  } catch (error) {
    logger.error(`Failed to fetch cart: ${error.message}`);
     next(error);
  }
};

// Update Cart Controller
export const updateCart = async (req, res, next) => {
  const { productId, quantity, variation } = req.body;
  if (!productId || !quantity || !variation) {
    return next(new ValidationError('Product ID, quantity, and variation are required'));
  }

  try {
    const cart = await updateCartService(req.user.id, { productId, quantity, variation });
    logger.info(`Cart update successfully for user ${req.user.id}`);
    res.status(200).json({ message: 'Cart updated', cart });
  } catch (error) {
    logger.error(`Failed to update cart: ${error.message}`);
     next(error);
  }
};

// Remove from Cart Controller
export const removeFromCart = async (req, res, next) => {
  const { productId, variation } = req.body;
  if (!productId || !variation) {
    return next(new ValidationError('Product ID and variation are required'));
  }

  try {
    const cart = await removeFromCartService(req.user.id, productId, variation);
    logger.info(`Product removed from cart for user ${req.user.id}`);
    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    logger.error(`Failed to remove product from cart: ${error.message}`);
    next(error);
  }
};
