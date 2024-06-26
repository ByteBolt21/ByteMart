import Product from '../models/product.model.js';
import { ValidationError, ProductCreationError } from '../utils/errors.js';

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

    return product;
  } catch (error) {
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
    return products;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to fetch a product by ID
export const getProductByIdService = async (productId) => {
  try {
    const product = await Product.findById(productId);
    return product;
  } catch (error) {
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
    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to delete a product by ID
export const deleteProductService = async (productId) => {
  try {
    const product = await Product.findByIdAndDelete(productId);
    return product;
  } catch (error) {
    throw new Error(error.message);
  }
};
