import { isValidObjectId } from 'mongoose';
import {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService
} from '../services/product.service.js';

import { ValidationError, ProductCreationError } from '../utils/errors.js';

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
    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
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
    res.json(products);
  } catch (error) {
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
    res.json(product);
  } catch (error) {
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
    res.json(product);
  } catch (error) {
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
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
