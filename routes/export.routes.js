import express from 'express';
import { exportAllData } from '../controllers/export.controller.js';
import auth from '../middlewares/auth.js';


const router = express.Router();

router.get('/export-all',exportAllData);

export default router;
