class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message) {
      super(message, 404);
    }
  }
  
  class ValidationError extends AppError {
    constructor(message) {
      super(message, 400);
    }
  }
  

  
class ProductCreationError extends AppError {
  constructor(message) {
    super(message, 500);
  }
}

export {
  AppError,
  NotFoundError,
  ValidationError,
  ProductCreationError
};