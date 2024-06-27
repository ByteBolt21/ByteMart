// checkout.controller.js

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
    const { shippingAddress, billingAddress, paymentDetails } = req.body;

    if (!shippingAddress || !billingAddress || !paymentDetails) {
        return next(new ValidationError('Shipping address, billing address, and payment details are required'));
    }

    try {
        const userId = req.user.id;
        // console.log("userId============", userId)
        logger.info(`Checkout initiated for user ID ${userId}`);

        // Verify cart contents
        const cart = await verifyCartContents(userId);
        logger.debug(`Cart verified for user ID ${userId}`);

        // console.log("after cart==========", cart)
        // Calculate total amount
        const totalAmount = calculateTotalAmount(cart);
        // console.log("after totalAmount==========", totalAmount)
        logger.debug(`Total amount calculated for user ID ${userId}: ${totalAmount}`);


        // Create order
        const order = await createOrder(userId, cart, totalAmount, shippingAddress, billingAddress);
        logger.info(`Order created successfully for user ID ${userId}: Order ID ${order._id}`);
        console.log("after order==========", order)


        // Process payment for stripe 
        // await processPayment(order, paymentDetails);
        // Process payment for paypal 
        const paymentResult = await processPaymentThroughPayPal(order, paymentDetails);
        logger.debug(`Payment processed successfully for PayPal: Order ID ${order._id}`);


        // console.log("payment==========DOne")
        // Update stock
        await updateStock(cart);
        logger.debug(`Stock updated after checkout: User ID ${userId}`);

        // Clear cart
        await clearCart(userId);
        logger.debug(`Cart cleared after checkout: User ID ${userId}`);

        // Send confirmation
        await sendConfirmation(order);
        logger.info(`Confirmation sent for order: Order ID ${order._id}`);

        
        // for stripe 
        // res.status(200).json({ message: 'Checkout successful', order });

        // for Paypal     
        res.status(200).json({ message: 'Checkout initiated', order, approvalUrl: paymentResult.approveLink });

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
  
      // Notify the user
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