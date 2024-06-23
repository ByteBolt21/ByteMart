import Product from '../models/product.model.js';

// Function to create a new product
export const createProductService = async (productData, userId) => {
  const { name, description, category, subcategory, brand, price, stock } = productData;
  try {
    const product = await Product.create({
      name,
      category,
      subcategory,
      description,
      brand,
      price,
      stock,
      seller: userId  // Assuming req.user.id is passed as userId
    });
    return product;
  } catch (error) {
    throw new Error(error.message);
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
