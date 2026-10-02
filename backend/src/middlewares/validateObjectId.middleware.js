import mongoose from 'mongoose';
import { ApiError } from '../utils/apiError.js';

/**
 * Middleware factory to validate MongoDB ObjectId in req.params
 * @param {string} [paramName='id'] - The name of the parameter to check in req.params
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (id && !mongoose.Types.ObjectId.isValid(id)) {
      return next(new ApiError(400, `Invalid ID format for parameter '${paramName}': ${id}`));
    }
    next();
  };
};
