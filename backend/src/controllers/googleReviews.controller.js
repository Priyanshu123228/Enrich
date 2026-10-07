import { googlePlacesService } from '../services/googlePlaces.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Get Google Business Profile reviews & place details
 * @route   GET /api/v1/google-reviews
 * @access  Public
 */
export const getGoogleReviews = asyncHandler(async (req, res) => {
  const forceRefresh = req.query.forceRefresh === 'true' || req.query.refresh === 'true';
  const data = await googlePlacesService.getPlaceReviews({ forceRefresh });

  return res.status(200).json(
    new ApiResponse(200, data, 'Google reviews retrieved successfully')
  );
});
