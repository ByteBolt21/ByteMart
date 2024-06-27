// checkout.service.js
import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import Order from '../models/order.model.js';
import { NotFoundError, ValidationError, CartOperationError } from '../utils/errors.js';
import stripePaymentGateway from '../utils/stripe/stripeGateway.js'; 
import paypalPaymentGateway from '../utils/paypal/paypalGateway.js'; 

export const verifyCartContents = async (userId) => {
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
  
  return cart;
};

export const calculateTotalAmount = (cart) => {
  return cart.items.reduce((total, item) => total + item.variation.price * item.quantity, 0);
};

export const createOrder = async (userId, cart, totalAmount, shippingAddress, billingAddress) => {
  const order = new Order({
    user: userId,
    items: cart.items,
    totalAmount,
    shippingAddress,
    billingAddress,
    status: 'Pending'
  });

  await order.save();
  return order;
};
//for stripe 
export const processPayment = async (order, paymentDetails) => {
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
  
  return paymentResult;
};
//for paypal
export const processPaymentThroughPayPal = async (order, paymentDetails) => {
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
  
  return paymentResult; // Return the PayPal approval URL
};


export const updateStock = async (cart) => {
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
};

export const clearCart = async (userId) => {
  const cart = await Cart.findOne({ user: userId });
  cart.items = [];
  await cart.save();
};

export const sendConfirmation = async (order) => {
  // Implementation for sending order confirmation (email/SMS)
  // Placeholder for actual implementation
  console.log('Order confirmation sent to user:', order.user);
};
