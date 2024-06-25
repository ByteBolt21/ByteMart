import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import errorHandlerMiddleware from './middlewares/error-handler.middleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Database connection error', err);
});

// User routes
app.use('/api/users', userRoutes);
// product routes
app.use('/api/products', productRoutes);
// Order routes
app.use('/api/orders', orderRoutes);

//  It's typically defined as the last middleware in the middleware chain so that it catches any errors thrown or passed to next() from previous middleware or route handlers.
// Error handling middleware
app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
