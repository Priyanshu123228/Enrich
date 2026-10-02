import { ApiError } from '../utils/apiError.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param  {...string} roles - Array of allowed roles (e.g. 'admin', 'staff')
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Unauthorized request: User authentication required'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `Access Denied: Role [${req.user.role}] is not authorized to access this resource`
        )
      );
    }

    next();
  };
};
