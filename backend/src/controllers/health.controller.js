import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import mongoose from 'mongoose';

/**
 * @desc    Health check endpoint for API and Database status
 * @route   GET /api/v1/health
 * @access  Public
 */
export const checkHealth = asyncHandler(async (req, res) => {
  const dbStatusMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  const dbState = mongoose.connection.readyState;
  const healthData = {
    service: 'Parlour Appointment Booking API',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    database: {
      status: dbStatusMap[dbState] || 'Unknown',
      isReady: dbState === 1
    }
  };

  return res.status(200).json(
    new ApiResponse(200, healthData, 'API is running smoothly')
  );
});
