import { ApiError } from '../utils/apiError.js';

/**
 * Validate staff creation payload
 */
export const validateCreateStaff = (req, res, next) => {
  const { name, email, phone, bio, experience } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2) {
    errors.push('Staff member name is required (min 2 characters)');
  }
  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Valid staff email address is required');
  }
  if (!phone || phone.trim().length < 7) {
    errors.push('Valid phone number is required');
  }
  if (!bio || bio.trim().length < 10) {
    errors.push('Bio is required (min 10 characters)');
  }
  if (experience === undefined || isNaN(experience) || Number(experience) < 0) {
    errors.push('Valid experience in years is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Staff Validation Failed', errors));
  }

  next();
};

/**
 * Validate staff update payload
 */
export const validateUpdateStaff = (req, res, next) => {
  const { name, email, phone, bio, experience, status } = req.body;
  const errors = [];

  if (name !== undefined && name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }
  if (email !== undefined && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Valid email address is required');
  }
  if (phone !== undefined && phone.trim().length < 7) {
    errors.push('Valid phone number is required');
  }
  if (bio !== undefined && bio.trim().length < 10) {
    errors.push('Bio must be at least 10 characters');
  }
  if (experience !== undefined && (isNaN(experience) || Number(experience) < 0)) {
    errors.push('Experience must be a non-negative number');
  }
  if (status !== undefined && !['active', 'inactive', 'on_leave'].includes(status)) {
    errors.push('Status must be one of: active, inactive, on_leave');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Staff Update Validation Failed', errors));
  }

  next();
};
