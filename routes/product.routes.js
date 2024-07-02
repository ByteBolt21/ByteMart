// routes/product.routes.js
import express from 'express';
import { createProduct, getProducts, getShuffledProducts, getProductById, updateProduct, deleteProduct, searchProducts, exportProductsCsv ,
    bulkImportProducts
 } from '../controllers/product.controller.js';
import auth from '../middlewares/auth.js';
import parser from '../middlewares/multer.js';
import csvUpload from '../middlewares/csvUpload.js'; // Import the CSV upload middleware

const router = express.Router();

router.post('/', auth(['seller']), parser.array('images', 5), createProduct); // Allow up to 5 images
router.get('/export', auth(['seller']), exportProductsCsv);
router.get('/shuffled', auth(), getShuffledProducts);
router.get('/search', auth(), searchProducts);  // for search we nee to call getProducts So we need the auth() middleware
router.get('/', auth(), getProducts);
router.get('/:id', auth(), getProductById);
router.put('/:id', auth(['seller']), parser.array('images', 5), updateProduct); // Allow up to 5 images for update
router.delete('/:id', auth(['seller']), deleteProduct);
router.post('/bulk-import', auth(['seller']), csvUpload.single('file'), bulkImportProducts); // New bulk import route


export default router;
