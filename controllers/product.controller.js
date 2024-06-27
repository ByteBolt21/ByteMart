import { isValidObjectId } from 'mongoose';
import {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService
} from '../services/product.service.js';

import { ValidationError, ProductCreationError } from '../utils/errors.js';
import logger from '../utils/logger.js';

// Controller function to create a product
export const createProduct = async (req, res, next) => {
  const { name, category, description, subcategory, brand, images, variations } = req.body;

  try {
    // Validate request data
    if (!name || !category || !description || !subcategory || !brand || !images || !variations) {
      throw new ValidationError('All fields are required');
    }

    // Validate variations stock
    if (!variations.every(variation => variation.stock != null && variation.price != null)) {
      throw new ValidationError('Each variation must have stock and price');
    }

    const product = await createProductService({ name, category, description, subcategory, brand, images, variations }, req.user.id);
    logger.info(`Product created successfully: ${name}`);
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    logger.error(`Create product error: ${error.message}`);
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message }); // Bad request due to validation error
    } else if (error instanceof ProductCreationError) {
      res.status(500).json({ error: error.message }); // Server error for product creation failure
    } else {
      res.status(500).json({ error: 'Failed to create product' }); // Generic server error
    }
  }
};

// Controller function to get all products
export const getProducts = async (req, res) => {
  try {
    const products = await getProductsService();
    logger.info('All products fetched successfully');
    res.json(products);
  } catch (error) {
    logger.error(`Get all products error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Controller function to get a product by ID
export const getProductById = async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new ValidationError('Invalid product ID format'));
  }
  try {
    const product = await getProductByIdService(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    logger.info(`Product fetched successfully: ${product.name}`);
    res.json(product);
  } catch (error) {
    logger.error(`Get product by ID error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};

// Controller function to update a product by ID
export const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new ValidationError('Invalid product ID format'));
  }
  const updateData = req.body;
  try {
    if (updateData.variations && !updateData.variations.every(variation => variation.stock != null && variation.price != null)) {
      throw new ValidationError('Each variation must have stock and price');
    }

    const product = await updateProductService(id, updateData);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    logger.info(`Product updated successfully: ${product.name}`);
    res.json(product);
  } catch (error) {
    logger.error(`Update product error: ${error.message}`);
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Controller function to delete a product by ID
export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return next(new ValidationError('Invalid product ID format'));
  }
  try {
    const product = await deleteProductService(id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    logger.info(`Product deleted successfully: ${product.name}`);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    logger.error(`Delete product error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
