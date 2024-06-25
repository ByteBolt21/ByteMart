// middleware/error-handler.middleware.js
// Error Middleware: Centralizes error handling, catches unhandled errors, and ensures consistent error responses.
// Controller Functions: Implement business logic, handle specific requests, and use next(error) to propagate errors for centralized handling.
// next(error): Passes control to error-handling middleware, ensuring errors are caught and processed uniformly across your application.

import { AppError } from '../utils/errors.js';
import mongoose from 'mongoose';

const errorHandlerMiddleware = (err, req, res, next) => {
    if (err instanceof AppError) {
        res.status(err.statusCode).json({ error: err.message });
    }
    // Mongoose validation error handling --> nicely handle mongoose validation errors --. BEST
    else if (err instanceof mongoose.Error.ValidationError) {
        const errors = Object.values(err.errors).map((val) => val.message);
        res.status(400).json({ error: errors });
    }
    else {
        console.error(err); // Log the error for debugging
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export default errorHandlerMiddleware;
