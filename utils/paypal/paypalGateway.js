import dotenv from 'dotenv';
import paypal from '@paypal/checkout-server-sdk';

dotenv.config();

let environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET);
let client = new paypal.core.PayPalHttpClient(environment);

// Function to create a PayPal order
export const createPayPalOrder = async (amount, paymentDetails) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: 'USD',
        value: Math.floor(amount) 
      }
    }],
    payer: {
      email_address: paymentDetails.email
    }
  });

  try {
    const order = await client.execute(request);
    return { id: order.result.id };
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    return { error: error.message };
  }
};

// Function to capture a PayPal payment
export const capturePayPalPayment = async (orderId) => {
  const request = new paypal.orders.OrdersCaptureRequest(orderId);
  request.requestBody({});

  try {
    const capture = await client.execute(request);
    return { id: capture.result.id, status: capture.result.status };
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    return { error: error.message };
  }
};

export default { createPayPalOrder, capturePayPalPayment };
