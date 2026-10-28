import { ApiError } from '../utils/apiError.js';

/**
 * Sanitize internal filesystem paths, OS directories, or package details from error messages
 */
const stripSensitivePaths = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[a-zA-Z]:\\[^:\s'"`]+/g, '[internal-path]')
    .replace(/\/(?:home|var|usr|app|root)\/[^:\s'"`]+/g, '[internal-path]')
    .replace(/node_modules\/[^:\s'"`]+/g, '[package]');
};

//  Handle 404 Route Not Found
export const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

//  Global Error Handler Middleware
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

  const statusCode = error.statusCode || 500;

  // Safe environment check:
  // ONLY expose stack traces if strictly in local developer environment.
  // NEVER expose stack traces on Render, Vercel, or non-local loopback requests.
  const isHosted = Boolean(process.env.RENDER || process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT);
  const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(req?.hostname);
  const isSafeDevMode = process.env.NODE_ENV === 'development' && !isHosted && isLocalhost;

  let rawMessage = error.message || 'Internal Server Error';
  if (statusCode >= 500 && !isSafeDevMode) {
    rawMessage = 'An unexpected server error occurred. Please try again later.';
  }

  const sanitizedMessage = stripSensitivePaths(rawMessage);
  const sanitizedErrors = (error.errors && error.errors.length > 0)
    ? error.errors.map(stripSensitivePaths)
    : [sanitizedMessage];

  res.status(statusCode).json({
    success: false,
    statusCode,
    message: sanitizedMessage,
    errors: sanitizedErrors,
    ...(isSafeDevMode && err.stack ? { stack: err.stack } : {})
  });
};
