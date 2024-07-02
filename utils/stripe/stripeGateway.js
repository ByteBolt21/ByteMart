// paymentGateway.js

import dotenv from 'dotenv';
dotenv.config();
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRETE_KEY);

const processPaymentThroughStripe = async (amount, paymentDetails) => {
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
    //we can update this from client secrete id to direct object and then we have to jsut update the order model

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return { error: error.message };
  }
};

export default { processPaymentThroughStripe };



//Testing of payment gateway
// we have to provide teh payment details like email, card number, cvv, exp month, exp year
// the dummy card the stripe is using for testing is 4242 4242 424
// {
//   "shippingAddress": "123 Main St, Cityville, ABC",
//   "billingAddress": "456 Elm St, Townsville, XYZ",
//   "paymentDetails": {
//       "email": "customer@example.com",
//       "cardNumber": "4242424242424242",
//       "expMonth": 12,
//       "expYear": 2025,
//       "cvc": "123"
//   }
// }



//The checkout works like a user login and create a cart and then when we give the payment details, the payment gateway is called and the payment is processed// it go to the database and check the cart created by the req.user who call the payment request and then payment proceed and the stock is updated and the order is created and the user is notified about the successful payment and// So far this is done and the email notification is not set upped yet. 

// And this is not the complete setuo we need the client side 
//client side handle form --> return an code (id)
// we send that in req.body and the amount to be deducted and then stripe handle itself --> this is for safety we cannot access card info in this way