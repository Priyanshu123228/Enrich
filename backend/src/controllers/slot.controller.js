import { getAvailableSlots } from '../services/slot.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Query dynamic available time slots for a service, staff, and date
 * @route   GET /api/v1/slots/available
 * @access  Public
 */
export const queryAvailableSlots = asyncHandler(async (req, res) => {
  const { serviceId, staffId, date } = req.query;

  const result = await getAvailableSlots({
    serviceId,
    staffId: staffId || 'any',
    date
  });

  return res.status(200).json(
    new ApiResponse(200, result, 'Available slots calculated successfully')
  );
});
