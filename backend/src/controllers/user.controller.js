import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';
import { Service } from '../models/Service.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Get all registered users / customers with booking stats
 * @route   GET /api/v1/users
 * @access  Private / Admin
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, search, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (role && role !== 'all') filter.role = role;
  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), 'i');
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    User.countDocuments(filter)
  ]);

  const usersWithStats = await Promise.all(
    users.map(async (u) => {
      const appointmentsCount = await Appointment.countDocuments({ customer: u._id });
      return { ...u, appointmentsCount };
    })
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        users: usersWithStats,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      },
      'Users fetched successfully'
    )
  );
});

/**
 * @desc    Toggle user account active status
 * @route   PUT /api/v1/users/:id/status
 * @access  Private / Admin
 */
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  user.isActive = !user.isActive;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, { _id: user._id, isActive: user.isActive }, `User marked as ${user.isActive ? 'Active' : 'Inactive'}`)
  );
});

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/:id
 * @access  Private / Admin
 */
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user._id.toString() === id) {
    throw new ApiError(400, 'Cannot delete your own admin account');
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'User account deleted successfully')
  );
});

/**
 * @desc    Get customer's saved/favorite services
 * @route   GET /api/v1/users/favorites
 * @access  Private / Customer
 */
export const getUserFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'favorites',
    match: { isActive: true }
  });

  return res.status(200).json(
    new ApiResponse(200, user.favorites || [], 'Favorite services retrieved successfully')
  );
});

/**
 * @desc    Toggle saved/favorite service
 * @route   POST /api/v1/users/favorites/:serviceId
 * @access  Private / Customer
 */
export const toggleFavoriteService = asyncHandler(async (req, res) => {
  const { serviceId } = req.params;
  const user = await User.findById(req.user._id);

  const service = await Service.findById(serviceId);
  if (!service) {
    throw new ApiError(404, 'Service not found');
  }

  const index = user.favorites.indexOf(serviceId);
  let isSaved = false;

  if (index > -1) {
    user.favorites.splice(index, 1);
    isSaved = false;
  } else {
    user.favorites.push(serviceId);
    isSaved = true;
  }

  await user.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      { isSaved, favoritesCount: user.favorites.length },
      isSaved ? 'Service saved to favorites' : 'Service removed from favorites'
    )
  );
});
