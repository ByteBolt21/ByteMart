import Product from '../models/product.model.js';
import User from '../models/user.model.js';
import { Parser } from 'json2csv';
import logger from '../utils/logger.js';

export const exportAllData = async (req, res) => {
  try {
    // Fetch product data from the database
    const products = await Product.find().populate('seller', 'username email');
    logger.debug(`Fetched ${products.length} products from the database`);

    // Fetch user data from the database
    const users = await User.find();
    logger.debug(`Fetched ${users.length} users from the database`);

    if (!products.length && !users.length) {
      logger.warn('No products or users found');
      return res.status(404).json({ error: 'No products or users found' });
    }

    // Format the product data
    const productData = products.map(product => {
      return product.variations.map(variation => ({
        _id: product._id,
        name: product.name,
        category: product.category,
        description: product.description,
        subcategory: product.subcategory,
        brand: product.brand,
        images: product.images.join('|'),
        sellerUsername: product.seller.username,
        sellerEmail: product.seller.email,
        color: variation.color,
        size: variation.size,
        price: variation.price,
        stock: variation.stock,
        createdAt: product.createdAt
      }));
    }).flat();

    // Format the user data
    const userData = users.map(user => ({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      number: user.number,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt
    }));

    // Define the fields for the CSV file
    const productFields = [
      '_id', 'name', 'category', 'description', 'subcategory', 'brand', 'images',
      'sellerUsername', 'sellerEmail',
      'color', 'size', 'price', 'stock', 'createdAt'
    ];

    const userFields = ['_id', 'fullName', 'username', 'email', 'number', 'role', 'isVerified', 'createdAt'];

    // Create CSV data
    const productParser = new Parser({ fields: productFields });
    const userParser = new Parser({ fields: userFields });
    const productCsv = productParser.parse(productData);
    const userCsv = userParser.parse(userData);

    // Combine the CSV data
    const combinedCsv = [
      'User Data',
      userCsv,
      '',
      'Product Data',
      productCsv
    ].join('\n');

    // Set headers to indicate file download
    res.header('Content-Type', 'text/csv');
    res.attachment('all_data.csv'); // Indicate file download
    res.send(combinedCsv);
    logger.info('CSV file sent successfully');
  } catch (error) {
    logger.error(`Error exporting all data: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};
