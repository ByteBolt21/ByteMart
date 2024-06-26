import Order from '../models/order.model.js';
import Product from '../models/product.model.js';
import { ValidationError, OrderCreationError, ProductNotFoundError, VariantNotFoundError, OrderNotFoundError } from '../utils/errors.js';

export const createOrderService = async (userId, orderData) => {
  const { products, shippingAddress, billingAddress } = orderData;

  try {
    let totalAmount = 0;
    const orderItems = [];

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        throw new ProductNotFoundError(`Product with ID ${item.product} not found`);
      }

      const variation = product.variations.find(v =>
        v.color === item.variation.color && v.size === item.variation.size
      );

      if (!variation) {
        throw new VariantNotFoundError(`Variant not found for product ${item.product} with color ${item.variation.color} and size ${item.variation.size}`);
      }

      const subtotal = variation.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        product: item.product,
        variation: {
          color: item.variation.color,
          size: item.variation.size,
          price: variation.price
        },
        quantity: item.quantity
      });

      // Update stock for the product variation (if needed)
      variation.stock -= item.quantity;
      await product.save();
    }

    const order = await Order.create({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      billingAddress
    });

    return order;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof ProductNotFoundError || error instanceof VariantNotFoundError) {
      throw error;
    } else {
      throw new OrderCreationError('Failed to create order');
    }
  }
};

export const getOrdersByBuyerIdService = async (userId) => {
  try {
    const orders = await Order.find({ user: userId }).populate('items.product');
    return orders;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const getOrderByIdService = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      throw new OrderNotFoundError(`Order with ID ${orderId} not found`);
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
      throw error;
    } else {
      throw new Error(error.message);
    }
  }
};

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
