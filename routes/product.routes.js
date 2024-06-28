import express from 'express';
import { createProduct, getProducts, getShuffledProducts , getProductById, updateProduct, deleteProduct, searchProducts, exportProductsCsv } from '../controllers/product.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', auth(['seller']), createProduct);
router.get('/export', auth(['seller']), exportProductsCsv);
router.get('/shuffled', auth(), getShuffledProducts);
router.get('/search',auth(), searchProducts);  // for search we nee to call getProducts So we need the auth() middleware
router.get('/', auth(), getProducts);
router.get('/:id',auth(), getProductById);
router.put('/:id', auth(['seller']), updateProduct);
router.delete('/:id', auth(['seller']), deleteProduct);
export default router;
