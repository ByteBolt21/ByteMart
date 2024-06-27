import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import { NotFoundError, ValidationError, CartOperationError } from '../utils/errors.js';
import stripePaymentGateway from '../utils/stripe/stripeGateway.js';
import paypalPaymentGateway from '../utils/paypal/paypalGateway.js';
import logger from '../utils/logger.js';

export const verifyCartContents = async (userId) => {
  try {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) throw new NotFoundError('Cart not found');

    for (const item of cart.items) {
      const product = item.product;
      const productVariation = product.variations.find(
        v => v.color === item.variation.color && v.size === item.variation.size
      );
      if (!productVariation || productVariation.stock < item.quantity) {
        throw new ValidationError(`Product ${product.name} with variation ${item.variation.color}/${item.variation.size} is not available in the requested quantity.`);
      }
    }
    
    logger.debug(`Cart verified for user ID ${userId}`);
    return cart;
  } catch (error) {
    logger.error(`Error verifying cart contents for user ID ${userId}: ${error.message}`);
    throw error;
  }
};

export const calculateTotalAmount = (cart) => {
  const totalAmount = cart.items.reduce((total, item) => total + item.variation.price * item.quantity, 0);
  logger.debug(`Total amount calculated: ${totalAmount}`);
  return totalAmount;
};

export const createOrder = async (userId, cart, totalAmount, shippingAddress, billingAddress) => {
  try {
    const order = new Order({
      user: userId,
      items: cart.items,
      totalAmount,
      shippingAddress,
      billingAddress,
      status: 'Pending'
    });

    await order.save();
    logger.info(`Order created successfully for user ID ${userId}: Order ID ${order._id}`);
    return order;
  } catch (error) {
    logger.error(`Failed to create order for user ID ${userId}: ${error.message}`);
    throw new CartOperationError('Failed to create order');
  }
};

export const processPayment = async (order, paymentDetails) => {
  try {
    const paymentResult = await stripePaymentGateway.processPaymentThroughStripe(order.totalAmount, paymentDetails);
    if (paymentResult.error) {
      throw new CartOperationError('Payment failed');
    }
    
    // Attach payment details to the order if needed
    order.payment = {
      method: 'Stripe',
      transactionId: paymentResult.clientSecret // Assuming you store this for reference
    };
  
    await order.save();
    logger.info(`Payment processed successfully for Stripe: Order ID ${order._id}`);
    return paymentResult;
  } catch (error) {
    logger.error(`Failed to process payment for Stripe: ${error.message}`);
    throw error;
  }
};

export const processPaymentThroughPayPal = async (order, paymentDetails) => {
  try {
    const paymentResult = await paypalPaymentGateway.createPayPalOrder(order.totalAmount, paymentDetails);
    if (paymentResult.error) {
      throw new CartOperationError('Payment failed');
    }
  
    // Attach payment details to the order if needed
    order.payment = {
      method: 'PayPal',
      transactionId: paymentResult.id
    };
  
    await order.save();
    logger.info(`Payment processed successfully for PayPal: Order ID ${order._id}`);
    return paymentResult; // Return the PayPal approval URL
  } catch (error) {
    logger.error(`Failed to process payment for PayPal: ${error.message}`);
    throw error;
  }
};

export const updateStock = async (cart) => {
  try {
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);
      const productVariation = product.variations.find(
        v => v.color === item.variation.color && v.size === item.variation.size
      );
      if (productVariation) {
        productVariation.stock -= item.quantity;
        await product.save();
      }
    }
    logger.debug(`Stock updated after checkout`);
  } catch (error) {
    logger.error(`Failed to update stock after checkout: ${error.message}`);
    throw error;
  }
};

export const clearCart = async (userId) => {
  try {
    const cart = await Cart.findOne({ user: userId });
    cart.items = [];
    await cart.save();
    logger.debug(`Cart cleared after checkout: User ID ${userId}`);
  } catch (error) {
    logger.error(`Failed to clear cart after checkout for user ID ${userId}: ${error.message}`);
    throw error;
  }
};

export const sendConfirmation = async (order) => {
  try {
    // Placeholder for actual implementation
    console.log('Order confirmation sent to user:', order.user);
    logger.info(`Order confirmation sent for order: Order ID ${order._id}`);
  } catch (error) {
    logger.error(`Failed to send order confirmation for order: Order ID ${order._id}: ${error.message}`);
    // Log the error but don't throw, as it's not critical to the checkout flow
  }
};
