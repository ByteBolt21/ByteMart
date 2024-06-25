import {
    addToCartService,
    getCartService,
    updateCartService,
    removeFromCartService
  } from '../services/cart.service.js';
  import { ValidationError, NotFoundError, CartOperationError } from '../utils/errors.js';
  
  // Add to Cart Controller
  export const addToCart = async (req, res, next) => {
    const { productId, quantity, variation } = req.body;
    if (!productId || !quantity || !variation) {
      return next(new ValidationError('Product ID, quantity, and variation are required'));
    }
  
    try {
      const cart = await addToCartService(req.user.id, { productId, quantity, variation });
      res.status(200).json({ message: 'Item added to cart', cart });
    } catch (error) {
      next(error);
    }
  };
  
  // Get Cart Controller
  export const getCart = async (req, res, next) => {
    try {
      const cart = await getCartService(req.user.id);
      res.status(200).json(cart);
    } catch (error) {
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
      res.status(200).json({ message: 'Cart updated', cart });
    } catch (error) {
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
      res.status(200).json({ message: 'Item removed from cart', cart });
    } catch (error) {
      next(error);
    }
  };
  