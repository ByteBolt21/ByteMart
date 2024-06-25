import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { ValidationError, OrderCreationError, ProductNotFoundError, VariantNotFoundError, OrderNotFoundError } from '../utils/errors.js';

export const createOrderService = async (buyerId, orderData) => {
  const { products, shippingAddress, billingAddress } = orderData;

  try {
    let totalAmount = 0;
    const orderProducts = [];

    // Loop through each product in the order request
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new ProductNotFoundError(`Product with ID ${item.product} not found`);
      }

      // Find the specific variation for the product based on color and size
      const variation = product.variations.find(v =>
        v.color === item.variation.color && v.size === item.variation.size
      );

      if (!variation) {
        throw new VariantNotFoundError(`Variant not found for product ${item.product} with color ${item.variation.color} and size ${item.variation.size}`);
      }

      // Calculate the subtotal for this particular item
      const subtotal = variation.price * item.quantity;
      totalAmount += subtotal;

      // Push the ordered item to the orderProducts array
      orderProducts.push({
        product: item.product,
        variation: {
          color: item.variation.color,
          size: item.variation.size,
          price: variation.price // Include the price from the variation
        },
        quantity: item.quantity
      });
    }

    // Create the order in the database
    const order = await Order.create({
      buyer: buyerId,
      products: orderProducts, // Use the processed orderProducts array
      totalAmount,
      shippingAddress,
      billingAddress
    });

    return order;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ProductNotFoundError || error instanceof VariantNotFoundError) {
      throw error; // Pass custom errors directly
    } else {
      throw new OrderCreationError('Failed to create order'); // Throw custom error for order creation failure
    }
  }
};

// Function to fetch orders for a specific buyer
export const getOrdersByBuyerIdService = async (buyerId) => {
  try {
    const orders = await Order.find({ buyer: buyerId }).populate('products.product');
    return orders;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to fetch an order by ID
export const getOrderByIdService = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('products.product');
    if (!order) {
      throw new OrderNotFoundError(`Order with ID ${orderId} not found`);
    }
    return order;
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      throw error; // Pass custom error directly
    } else {
      throw new Error(error.message);
    }
  }
};

// Function to update order status and tracking information
export const updateOrderStatusService = async (orderId, status, trackingId) => {
  try {
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status, trackingId },
      { new: true }
    );
    if (!order) {
      throw new OrderNotFoundError(`Order with ID ${orderId} not found`);
    }
    return order;
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      throw error; // Pass custom error directly
    } else {
      throw new Error(error.message);
    }
  }
};


// Function to delete an order by ID
export const deleteOrderByIdService = async (orderId) => {
  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      throw new OrderNotFoundError('Order not found');
    }
    return order;
  } catch (error) {
    if (error instanceof OrderNotFoundError) {
      throw error;
    } else {
      throw new Error(error.message);
    }
  }
};