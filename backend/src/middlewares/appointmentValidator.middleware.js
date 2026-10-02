import { ApiError } from '../utils/apiError.js';

/**
 * Validate appointment creation
 */
export const validateCreateAppointment = (req, res, next) => {
  const { serviceId, date, startTime } = req.body;
  const errors = [];

  if (!serviceId) errors.push('Service ID is required');
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push('Valid date in YYYY-MM-DD format is required');
  }
  if (!startTime || !/^\d{2}:\d{2}$/.test(startTime)) {
    errors.push('Valid start time in HH:mm 24-hour format is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Appointment Validation Failed', errors));
  }

  next();
};

/**
 * Validate appointment reschedule
 */
export const validateRescheduleAppointment = (req, res, next) => {
  const { newDate, newStartTime } = req.body;
  const errors = [];

  if (!newDate || !/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    errors.push('Valid new date in YYYY-MM-DD format is required');
  }
  if (!newStartTime || !/^\d{2}:\d{2}$/.test(newStartTime)) {
    errors.push('Valid new start time in HH:mm format is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Reschedule Validation Failed', errors));
  }

  next();
};

/**
 * Validate status update
 */
export const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const allowed = ['pending', 'confirmed', 'completed', 'cancelled'];

  if (!status || !allowed.includes(status)) {
    return next(
      new ApiError(
        400,
        `Invalid status. Allowed values are: ${allowed.join(', ')}`
      )
    );
  }

  next();
};
