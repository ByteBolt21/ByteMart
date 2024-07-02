import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const generateAccessToken = async () => {
  const response = await axios({
    url: process.env.PAYPAL_BASE_URL + '/v1/oauth2/token',
    method: 'post',
    data: 'grant_type=client_credentials',
    auth: {
      username: process.env.PAYPAL_CLIENT_ID,
      password: process.env.PAYPAL_SECRET
    }
  });

  return response.data.access_token;
};

export const createPayPalOrder = async (amount, paymentDetails) => {
  const accessToken = await generateAccessToken();

  const response = await axios({
    url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    data: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: 'USD',
              value: amount.toFixed(2)
            }
          }
        }
      }],
      payer: {
        email_address: paymentDetails.email
      },
      application_context: {
        return_url: `${process.env.BASE_URL}/complete-order`,
        cancel_url: `${process.env.BASE_URL}/cancel-order`,
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
        brand_name: 'YourBrandName'
      }
    })
  });

  if (response.data.links) {
    //we can update this from id to direct object and then we have to jsut update the order model
    return { id: response.data.id, approveLink: response.data.links.find(link => link.rel === 'approve').href };
  } else {
    throw new Error('Error creating PayPal order');
  }
};



export const capturePayPalPayment = async (orderId) => {
  const accessToken = await generateAccessToken();

  try {
    const response = await axios({
      url: `${process.env.PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('PayPal Capture Error:', error.response.data);
    throw error;
  }
};

export default { createPayPalOrder, capturePayPalPayment };

// user request on checkout.controller.js and we first create an order  in the paypal and then we send the approval link to the user
// Then in frontend we redirect the user to the approval link and it open the "paypal payment page" after payment done by user we redirect the user to "complete-order" route
// And in complete-order route we capture the payment from paypal and update the order status in our database.