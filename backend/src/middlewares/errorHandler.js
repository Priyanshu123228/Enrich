import { ApiError } from '../utils/apiError.js';

/**
 * Handle 404 Route Not Found
 */
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

/**
 * Global Error Handler Middleware
 */
export const errorHandler = (err, req, res, next) => {
  let error = err;

  // 1. Convert Mongoose CastError (invalid ObjectId) to 400 Bad Request
  if (err.name === 'CastError') {
    const message = `Resource not found. Invalid field value '${err.value}' for '${err.path}'`;
    error = new ApiError(400, message, [message]);
  }

  // 2. Convert Mongoose Duplicate Key Error (Code 11000) to 409 Conflict
  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyValue || {}).join(', ');
    const message = `Duplicate value entered for field(s): ${duplicateFields}`;
    error = new ApiError(409, message, [message]);
  }

  // 3. Convert Mongoose ValidationError to 400 Bad Request
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors || {}).map((e) => e.message);
    const message = 'Validation error: ' + validationErrors.join('; ');
    error = new ApiError(400, message, validationErrors);
  }

  // 4. Convert JWT Errors to 401 Unauthorized
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token. Please sign in again.');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token has expired. Please sign in again.');
  }

  // 5. Convert Multer Errors to 400 Bad Request
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new ApiError(400, 'File upload error: File size exceeds the allowed limit.');
    } else {
      error = new ApiError(400, `File upload error: ${err.message}`);
    }
  }

  // Default to 500 if not an ApiError instance
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  const errors = error.errors || [];

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: errors.length > 0 ? errors : [message],
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
