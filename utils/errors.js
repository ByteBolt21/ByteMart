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


class OrderCreationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OrderCreationError';
    this.statusCode = 500;
  }
}

class ProductNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ProductNotFoundError';
    this.statusCode = 404;
  }
}

class VariantNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VariantNotFoundError';
    this.statusCode = 404;
  }
}

class OrderNotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'OrderNotFoundError';
    this.statusCode = 404;
  }
}

export {
  AppError,
  NotFoundError,
  ValidationError,
  ProductCreationError,
  OrderNotFoundError,
  VariantNotFoundError,
  ProductNotFoundError,
  OrderCreationError
};