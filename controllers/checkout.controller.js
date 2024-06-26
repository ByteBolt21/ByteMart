// checkout.controller.js

import {
    verifyCartContents,
    calculateTotalAmount,
    createOrder,
    processPayment,
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
        // Process payment
        await processPayment(order, paymentDetails);

        console.log("payment==========DOne")
        // Update stock
        await updateStock(cart);

        // Clear cart
        await clearCart(userId);

        // Send confirmation
        await sendConfirmation(order);

        res.status(200).json({ message: 'Checkout successful', order });
    } catch (error) {
        next(error);
    }
};
