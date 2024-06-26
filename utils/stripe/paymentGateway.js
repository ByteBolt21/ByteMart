// paymentGateway.js

import Stripe from 'stripe';

const stripe = new Stripe('sk_test_51PVojF07bbRBZ1HHqAbKCxUMmCvl8bG74L3zm6OzA4CplVy6qDqfNRxUttOjUxYHFmtYfbIAP7kZIosKKftv23wp009Wl8096G');

const processPayment = async (amount, paymentDetails) => {
  try {
    console.log("paymentDetails- in paymentProcess========= " , paymentDetails)
    console.log("amount- in paymentProcess========= " , amount)
    console.log("flooAmount- in paymentProcess========= " , Math.floor(amount));
    // we need to floor because stripe is not getting decimal values --> One Hour to fix 
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.floor(amount * 100), // Amount in cents
      currency: 'usd', // Adjust currency as needed
      payment_method_types: ['card'],
      description: 'Payment for Order',
      receipt_email: paymentDetails.email, // Customer's email for receipt
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { error: error.message };
  }
};

export default { processPayment };
