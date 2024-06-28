// checkout.controller.js

import Order from '../models/order.model.js';
import {
    verifyCartContents,
    calculateTotalAmount,
    createOrder,
    processPayment,
    processPaymentThroughPayPal,
    updateStock,
    clearCart,
    sendConfirmation
} from '../services/checkout.service.js';
import { ValidationError } from '../utils/errors.js';
import logger from '../utils/logger.js';


export const checkout = async (req, res, next) => {
  const { shippingAddress, billingAddress, paymentDetails, paymentMethod } = req.body;

  if (!shippingAddress || !billingAddress || !paymentDetails || !paymentMethod) {
    return next(new ValidationError('Shipping address, billing address, payment details, and payment method are required'));
  }

  try {
    const userId = req.user.id;
    logger.info(`Checkout initiated for user ID ${userId}`);

    // Verify cart contents
    const cart = await verifyCartContents(userId);
    logger.debug(`Cart verified for user ID ${userId}`);

    // Calculate total amount
    const totalAmount = calculateTotalAmount(cart);
    logger.debug(`Total amount calculated for user ID ${userId}: ${totalAmount}`);

    // Create order
    const order = await createOrder(userId, cart, totalAmount, shippingAddress, billingAddress);
    logger.info(`Order created successfully for user ID ${userId}: Order ID ${order._id}`);

    // Process payment based on payment method
    switch (paymentMethod) {
      case 'stripe':
        // Process payment for Stripe
        await processPayment(order, paymentDetails);

        // Update stock, clear cart, and send confirmation email
        await updateStock(cart);
        await clearCart(userId);
        await sendConfirmation(order);
        logger.info(`Checkout successful for user ID ${userId}: Order ID ${order._id}`);

        res.status(200).json({ message: 'Checkout successful', order });
        break;

      case 'paypal':
        // Process payment for PayPal
        const paymentResult = await processPaymentThroughPayPal(order, paymentDetails);
        logger.info(`PayPal payment initiated for user ID ${userId}: Order ID ${order._id}`);

        res.status(200).json({ message: 'Checkout initiated', order, approvalUrl: paymentResult.approveLink });
        break;

      default:
        throw new ValidationError('Invalid payment method');
    }
  } catch (error) {
    logger.error(`Checkout process failed: ${error.message}`);
    next(error);
  }
};



export const completeOrder = async (req, res, next) => {
  const { token, PayerID } = req.query; // These are the query parameters PayPal will return

  try {
    // Capture the payment
    const captureResult = await capturePayPalPayment(token);

    // Update the order status
    const order = await Order.findOne({ 'payment.transactionId': token });
    if (!order) throw new NotFoundError('Order not found');

    order.status = 'Completed';
    await order.save();

    // Update stock, clear cart, and send confirmation email
    await updateStock(order.cart);
    await clearCart(order.userId);
    await sendConfirmation(order);
    logger.info(`Order completed successfully: Order ID ${order._id}`);

    res.status(200).json({ message: 'Payment completed successfully', order });
  } catch (error) {
    logger.error(`Payment completion failed: ${error.message}`);
    next(error);
  }
};

export const cancelOrder = (req, res) => {
  res.status(200).json({ message: 'Payment cancelled' });
};