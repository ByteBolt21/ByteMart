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

export const checkout = async (req, res, next) => {
    const { shippingAddress, billingAddress, paymentDetails } = req.body;

    if (!shippingAddress || !billingAddress || !paymentDetails) {
        return next(new ValidationError('Shipping address, billing address, and payment details are required'));
    }

    try {
        const userId = req.user.id;
        console.log("userId============", userId)
        // Verify cart contents
        const cart = await verifyCartContents(userId);
        console.log("after cart==========", cart)
        // Calculate total amount
        const totalAmount = calculateTotalAmount(cart);
        console.log("after totalAmount==========", totalAmount)

        // Create order
        const order = await createOrder(userId, cart, totalAmount, shippingAddress, billingAddress);

        console.log("after order==========", order)
        // Process payment for stripe 
        // await processPayment(order, paymentDetails);
        // Process payment for paypal 
        const paymentResult = await processPaymentThroughPayPal(order, paymentDetails);


        console.log("payment==========DOne")
        // Update stock
        await updateStock(cart);

        // Clear cart
        await clearCart(userId);

        // Send confirmation
        await sendConfirmation(order);
        // for stripe 
        // res.status(200).json({ message: 'Checkout successful', order });
        // for Paypal     
        res.status(200).json({ message: 'Checkout initiated', order, approvalUrl: paymentResult.approveLink });

    } catch (error) {
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
  
      res.status(200).json({ message: 'Payment completed successfully', order });
  
    } catch (error) {
      next(error);
    }
  };
  
  export const cancelOrder = (req, res) => {
    res.status(200).json({ message: 'Payment cancelled' });
  };