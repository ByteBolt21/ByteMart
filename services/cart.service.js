import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import { ValidationError, NotFoundError, CartOperationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// Add to Cart Service
export const addToCartService = async (userId, { productId, quantity, variation }) => {
  try {
    // console.log('Product ID:', productId);
    // console.log('Quantity:', quantity);
    // console.log('Variation:', variation); 
    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError(`Product with ID ${productId} not found`);

    const productVariation = product.variations.find(v =>
      v.color === variation.color && v.size === variation.size && v.stock === variation.stock
    );
    // console.log("productVariation=========",productVariation);
    if (!productVariation) throw new NotFoundError(`Variation not found for product with color ${variation.color} and size ${variation.size}`);
    // console.log("productVariation.stock=========",productVariation.stock);

    let cart = await Cart.findOne({ user: userId });
    // console.log("cartFound====" , cart)
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    
    // console.log("cartMade====" , cart)
    // console.log("cart.items====" , cart.items)

    const cartItem = cart.items.find(item => item.product.toString() === productId && item.variation.color === variation.color && item.variation.size === variation.size);
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cart.items.push({
        product: productId,
        variation: {
          color: variation.color,
          size: variation.size,
          price: productVariation.price,
          stock: productVariation.stock // Ensure stock is included
        },
        quantity
      });
    }

    await cart.save();
    logger.info(`Added product to cart: ${productId}, Quantity: ${quantity}, User: ${userId}`);
    return cart;
  } catch (error) {
    logger.error(`Add to cart service error: ${error.message}`);
    throw new CartOperationError(error.message);
  }
};

// Get Cart Service
export const getCartService = async (userId) => {
  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) throw new NotFoundError('Cart not found');
    logger.info(`Fetched cart for user: ${userId}`);
    return cart;
  } catch (error) {
    logger.error(`Get cart service error: ${error.message}`);
    throw new CartOperationError(error.message);
  }
};

// Update Cart Service
export const updateCartService = async (userId, { productId, quantity, variation }) => {
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new NotFoundError('Cart not found');

    const cartItem = cart.items.find(item => item.product.toString() === productId && item.variation.color === variation.color && item.variation.size === variation.size);
    if (!cartItem) throw new NotFoundError(`Product with the specified variation not found in cart`);

    cartItem.quantity = quantity;
    await cart.save();
    logger.info(`Updated cart for user: ${userId}, Product: ${productId}, Quantity: ${quantity}`);
    return cart;
  } catch (error) {
    logger.error(`Update cart service error: ${error.message}`);
    throw new CartOperationError(error.message);
  }
};

// Remove from Cart Service
export const removeFromCartService = async (userId, productId, variation) => {
  try {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new NotFoundError('Cart not found');

    cart.items = cart.items.filter(item => !(item.product.toString() === productId && item.variation.color === variation.color && item.variation.size === variation.size));
    await cart.save();
    logger.info(`Removed product from cart: ${productId}, User: ${userId}`);
    return cart;
  } catch (error) {
    logger.error(`Remove from cart service error: ${error.message}`);
     throw new CartOperationError(error.message);
  }
};
