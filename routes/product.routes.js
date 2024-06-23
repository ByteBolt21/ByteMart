import express from 'express';
import { createProduct, getProducts, getProductById, updateProduct, deleteProduct } from '../controllers/product.controller.js';
import auth from '../middlewares/auth.js';

const router = express.Router();

router.post('/', auth(['seller']), createProduct);
router.get('/', auth(), getProducts);
router.get('/:id',auth(), getProductById);
router.put('/:id', auth(['seller']), updateProduct);
router.delete('/:id', auth(['seller']), deleteProduct);

export default router;
