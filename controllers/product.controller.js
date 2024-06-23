import {
    createProductService,
    getProductsService,
    getProductByIdService,
    updateProductService,
    deleteProductService
  } from '../services/product.service.js';
  
  // Controller function to create a product
  export const createProduct = async (req, res) => {
    const { name, category, description,subcategory, brand, price, stock } = req.body;
    try {
      const product = await createProductService({ name, category, description ,subcategory, brand, price, stock }, req.user.id);
      res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
      res.status(500).json({ error: error.message });
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
  export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
      const product = await getProductByIdService(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Controller function to update a product by ID
  export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
      const product = await updateProductService(id, updateData);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Controller function to delete a product by ID
  export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
      const product = await deleteProductService(id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  