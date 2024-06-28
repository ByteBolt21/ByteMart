// cron/reshuffleCron.js
import cron from 'node-cron';
import { reshuffleProductsService } from '../services/product.service.js';
import logger from '../utils/logger.js';


cron.schedule('*/10 * * * * *', async () => {
  try {
    const shuffledProducts = await reshuffleProductsService();
    logger.info('Products reshuffled successfully');
    // You can perform additional operations with shuffledProducts here if needed
  } catch (error) {
    logger.error(`Error reshuffling products: ${error.message}`);
  }
});
