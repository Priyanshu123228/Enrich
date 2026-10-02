import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { User } from '../models/User.js';

/**
 * Protect routes by verifying JWT Bearer token
 */
export const verifyJWT = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Extract token from Authorization header or Cookie
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new ApiError(401, 'Unauthorized request: No token provided');
  }

  try {
    // 2. Verify Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Find User by ID from decoded token payload
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'Invalid token: User no longer exists');
    }

    if (!user.isActive) {
      throw new ApiError(403, 'Your account has been deactivated. Please contact support.');
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token expired. Please sign in again.');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new ApiError(401, 'Invalid authentication token.');
    }
    throw error;
  }
});
