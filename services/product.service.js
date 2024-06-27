import Product from '../models/product.model.js';
import { ValidationError, ProductCreationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// Function to create a product
export const createProductService = async ({ name, category, description, subcategory, brand, images, variations }, userId) => {
  try {
    // Validate required fields
    if (!name || !category || !description || !subcategory || !brand || !images || !variations) {
      throw new ValidationError('All fields are required');
    }

    // Validate variations stock
    if (!variations.every(variation => variation.stock != null && variation.price != null)) {
      throw new ValidationError('Each variation must have stock and price');
    }

    const product = await Product.create({
      name,
      category,
      description,
      subcategory,
      brand,
      images,
      variations: variations.map(variation => ({
        color: variation.color,
        size: variation.size,
        price: variation.price,
        stock: variation.stock
      })),
      seller: userId,
    });

    logger.info(`Product created: ${name}`);
    return product;
  } catch (error) {
    logger.error(`Create product service error: ${error.message}`);
    if (error instanceof ValidationError) {
      throw error; // Pass custom validation errors directly
    } else {
      throw new ProductCreationError('Failed to create product'); // Throw custom error for product creation failure
    }
  }
};

// Function to fetch all products
export const getProductsService = async () => {
  try {
    const products = await Product.find();
    logger.info('Fetched all products');
    return products;
  } catch (error) {
    logger.error(`Get products service error: ${error.message}`);
    throw new Error(error.message);
  }
};

// Function to fetch a product by ID
export const getProductByIdService = async (productId) => {
  try {
    const product = await Product.findById(productId);
    logger.info(`Fetched product by ID: ${productId}`);
    return product;
  } catch (error) {
    logger.error(`Get product by ID service error: ${error.message}`);
    throw new Error(error.message);
  }
};

// Function to update a product by ID
export const updateProductService = async (productId, updateData) => {
  try {
    // Validate variations stock if updating variations
    if (updateData.variations && !updateData.variations.every(variation => variation.stock != null && variation.price != null)) {
      throw new ValidationError('Each variation must have stock and price');
    }

    const product = await Product.findByIdAndUpdate(productId, updateData, { new: true });
    logger.info(`Updated product: ${productId}`);
    return product;
  } catch (error) {
    logger.error(`Update product service error: ${error.message}`);
    throw new Error(error.message);
  }
};

// Function to delete a product by ID
export const deleteProductService = async (productId) => {
  try {
    const product = await Product.findByIdAndDelete(productId);
    logger.info(`Deleted product: ${productId}`);
    return product;
  } catch (error) {
    logger.error(`Delete product service error: ${error.message}`);
    throw new Error(error.message);
  }
};
