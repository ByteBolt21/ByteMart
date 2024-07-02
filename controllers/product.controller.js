import { isValidObjectId } from 'mongoose';
import {
  createProductService,
  getProductsService,
  getProductByIdService,
  updateProductService,
  deleteProductService,
  reshuffleProductsService
} from '../services/product.service.js';
import Product from '../models/product.model.js';
import { Parser } from 'json2csv';
import { parseCsv } from '../utils/csvParser.js';
import { ValidationError, ProductCreationError } from '../utils/errors.js';
import logger from '../utils/logger.js';



export const createProduct = async (req, res, next) => {
  const { name, category, description, subcategory, brand, variations } = req.body;
  const images = req.files.map(file => file.path);

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

export const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  const images = req.files ? req.files.map(file => file.path) : undefined;
  const updateData = req.body;

  if (!isValidObjectId(id)) {
    return next(new ValidationError('Invalid product ID format'));
  }

  if (images) {
    updateData.images = images;
  }

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

// Controller function to search products
export const searchProducts = async (req, res) => {
  console.log("inSearch===============")
  const { name, category, minPrice, maxPrice, brand, subcategory } = req.query;
  let query = {};

  if (name) {
    query.name = { $regex: name, $options: 'i' }; // Case-insensitive regex search
  }
  if (category) {
    query.category = category;
  }
  if (brand) {
    query.brand = brand;
  }
  if (subcategory) {
    query.subcategory = subcategory;
  }
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) {
      query.price.$gte = parseFloat(minPrice);
    }
    if (maxPrice) {
      query.price.$lte = parseFloat(maxPrice);
    }
  }

  try {
    const products = await Product.find(query);
    logger.info(`Products searched successfully with query: ${JSON.stringify(query)}`);
    res.status(200).json(products);
  } catch (error) {
    logger.error(`Error searching products: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};




export const getShuffledProducts = async (req, res) => {
  try {
    const products = await reshuffleProductsService();
    res.json(products);
  } catch (error) {
    logger.error(`Error fetching shuffled products: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};



export const exportProductsCsv = async (req, res) => {
  try {
    logger.info('Export products process initiated');

    // Fetch product data from the database
    const products = await Product.find().populate('seller', 'username email');
    logger.debug(`Fetched ${products.length} products from the database`);

    if (!products.length) {
      logger.warn('No products found');
      return res.status(404).json({ error: 'No products found' });
    }

    // Define the fields for the CSV file
    const fields = [
      '_id', 'name', 'category', 'description', 'subcategory', 'brand', 'images',
      { label: 'Seller Username', value: 'seller.username' },
      { label: 'Seller Email', value: 'seller.email' },
      'variations.color', 'variations.size', 'variations.price', 'variations.stock', 'createdAt'
    ];
    const opts = { fields };

    // Parse the data to CSV format
    const parser = new Parser(opts);
    const csvData = parser.parse(products);
    logger.debug('Parsed product data to CSV format');

    // Set headers to indicate file download
    res.header('Content-Type', 'text/csv');
    res.attachment('products.csv');  // This line indicates that the response should be downloaded as a file named 'products.csv'
    logger.info('Headers set for CSV file download');
    res.send(csvData);
    logger.info('CSV file sent successfully');

  } catch (error) {
    logger.error(`Error exporting products: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};





export const bulkImportProducts = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No CSV file uploaded' });
  }

  try {
    const csvData = await parseCsv(req.file.buffer);
    
    const products = await Promise.all(csvData.map(async (row) => {
      const { name, category, description, subcategory, brand, images, variations } = row;
      const parsedImages = images.split('|'); // Assuming images are separated by '|'
      const parsedVariations = JSON.parse(variations); // Assuming variations are provided as JSON string

      return createProductService({
        name,
        category,
        description,
        subcategory,
        brand,
        images: parsedImages,
        variations: parsedVariations,
      }, req.user.id);
    }));

    logger.info('Bulk products imported successfully');
    res.status(201).json({ message: 'Bulk products imported successfully', products });
  } catch (error) {
    logger.error(`Bulk import error: ${error.message}`);
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof ProductCreationError) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Failed to import products' });
    }
  }
};