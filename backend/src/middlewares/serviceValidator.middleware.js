import { ApiError } from '../utils/apiError.js';

const ALLOWED_CATEGORIES = ['Hair', 'Skin', 'Makeup', 'Nails', 'Spa', 'Bridal'];

/**
 * Validate service creation payload
 */
export const validateCreateService = (req, res, next) => {
  const { name, description, category, price, duration } = req.body;
  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('Service name is required (min 3 characters)');
  }
  if (!description || description.trim().length < 10) {
    errors.push('Service description is required (min 10 characters)');
  }
  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    errors.push(`Valid category is required. Allowed: ${ALLOWED_CATEGORIES.join(', ')}`);
  }
  if (price === undefined || isNaN(price) || Number(price) < 0) {
    errors.push('Valid positive price is required');
  }
  if (duration === undefined || isNaN(duration) || Number(duration) < 5) {
    errors.push('Valid duration is required (minimum 5 minutes)');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Service Validation Failed', errors));
  }

  next();
};

/**
 * Validate service update payload
 */
export const validateUpdateService = (req, res, next) => {
  const { name, description, category, price, duration, discountPrice } = req.body;
  const errors = [];

  if (name !== undefined && name.trim().length < 3) {
    errors.push('Service name must be at least 3 characters');
  }
  if (description !== undefined && description.trim().length < 10) {
    errors.push('Service description must be at least 10 characters');
  }
  if (category !== undefined && !ALLOWED_CATEGORIES.includes(category)) {
    errors.push(`Category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`);
  }
  if (price !== undefined && (isNaN(price) || Number(price) < 0)) {
    errors.push('Price must be a positive number');
  }
  if (discountPrice !== undefined && (isNaN(discountPrice) || Number(discountPrice) < 0)) {
    errors.push('Discount price must be a positive number');
  }
  if (duration !== undefined && (isNaN(duration) || Number(duration) < 5)) {
    errors.push('Duration must be at least 5 minutes');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Service Update Validation Failed', errors));
  }

  next();
};
