import { Review } from '../models/Review.js';
import { Service } from '../models/Service.js';
import { Appointment } from '../models/Appointment.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Public: Get approved reviews (optionally filtered by service)
 */
export const getPublicReviews = asyncHandler(async (req, res) => {
  const { serviceId, limit = 20, rating } = req.query;
  const filter = { isApproved: true };
  if (serviceId) filter.service = serviceId;
  if (rating) filter.rating = Number(rating);

  const reviews = await Review.find(filter)
    .populate('customer', 'name avatar')
    .populate('service', 'name category price images')
    .populate('staff', 'name avatar specialization')
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  return res.status(200).json(
    new ApiResponse(200, reviews, 'Reviews fetched successfully')
  );
});

/**
 * Customer: Get customer's submitted reviews
 */
export const getMyReviews = asyncHandler(async (req, res) => {
  const customerId = req.user._id;

  const reviews = await Review.find({ customer: customerId })
    .populate('service', 'name category price images')
    .populate('staff', 'name avatar')
    .populate('appointment', 'bookingId date startTime')
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, reviews, 'Your reviews fetched successfully')
  );
});

/**
 * Customer: Get completed appointments that have not yet been reviewed
 */
export const getPendingReviewAppointments = asyncHandler(async (req, res) => {
  const customerId = req.user._id;

  // 1. Find all completed appointments for this customer
  const completedAppointments = await Appointment.find({
    customer: customerId,
    status: 'completed'
  })
    .populate('service', 'name category price images')
    .populate('staff', 'name avatar')
    .sort({ date: -1, startTime: -1 })
    .lean();

  // 2. Find IDs of appointments already reviewed
  const existingReviews = await Review.find({
    customer: customerId
  }).select('appointment');

  const reviewedAppointmentIds = new Set(
    existingReviews.map((r) => r.appointment?.toString())
  );

  // 3. Filter only unreviewed completed appointments
  const unreviewedAppointments = completedAppointments.filter(
    (app) => !reviewedAppointmentIds.has(app._id.toString())
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      unreviewedAppointments,
      'Pending review appointments fetched successfully'
    )
  );
});

/**
 * Customer: Submit review for a completed appointment
 * Strict check: Only customers with completed appointments can review
 */
export const createReview = asyncHandler(async (req, res) => {
  const { appointmentId, rating, comment } = req.body;
  const customerId = req.user._id;

  if (!appointmentId) {
    throw new ApiError(400, 'Appointment ID is required to submit a review');
  }
  if (!rating || rating < 1 || rating > 5) {
    throw new ApiError(400, 'Rating must be an integer between 1 and 5');
  }
  if (!comment || comment.trim().length === 0) {
    throw new ApiError(400, 'Review comment cannot be empty');
  }

  // 1. Verify Appointment existence
  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  // 2. Verify appointment ownership
  if (appointment.customer.toString() !== customerId.toString()) {
    throw new ApiError(403, 'You can only review your own appointments');
  }

  // 3. CRITICAL RULE: Only completed appointments can be reviewed
  if (appointment.status !== 'completed') {
    throw new ApiError(
      400,
      `Only completed appointments can be reviewed. Your appointment is currently "${appointment.status}".`
    );
  }

  // 4. Prevent duplicate reviews for the same appointment
  const existingReview = await Review.findOne({ appointment: appointmentId });
  if (existingReview) {
    throw new ApiError(409, 'You have already submitted a review for this completed appointment');
  }

  // 5. Create Review linking customer, service, staff, and appointment
  const review = await Review.create({
    customer: customerId,
    service: appointment.service,
    staff: appointment.staff,
    appointment: appointmentId,
    rating: Number(rating),
    comment: comment.trim(),
    date: new Date(),
    isApproved: true
  });

  // 6. Recalculate average rating on Service
  const serviceReviews = await Review.find({
    service: appointment.service,
    isApproved: true
  });
  const avg =
    serviceReviews.reduce((sum, r) => sum + r.rating, 0) /
    (serviceReviews.length || 1);

  await Service.findByIdAndUpdate(appointment.service, {
    ratingAverage: parseFloat(avg.toFixed(1)),
    ratingCount: serviceReviews.length
  });

  const populatedReview = await Review.findById(review._id)
    .populate('customer', 'name avatar')
    .populate('service', 'name category')
    .populate('staff', 'name');

  return res.status(201).json(
    new ApiResponse(201, populatedReview, 'Thank you! Your verified review has been published.')
  );
});

/**
 * Admin: Get all reviews for moderation
 */
export const getAdminReviews = asyncHandler(async (req, res) => {
  const { status, rating, search } = req.query;
  const filter = {};

  if (status === 'approved') filter.isApproved = true;
  if (status === 'hidden') filter.isApproved = false;
  if (rating) filter.rating = Number(rating);

  const reviews = await Review.find(filter)
    .populate('customer', 'name email avatar phone')
    .populate('service', 'name category price')
    .populate('staff', 'name specialization')
    .populate('appointment', 'bookingId date startTime')
    .sort({ createdAt: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, reviews, 'All reviews for moderation fetched')
  );
});

/**
 * Admin: Toggle review approval / visibility
 */
export const toggleReviewApproval = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, 'Review not found');

  review.isApproved = !review.isApproved;
  await review.save();

  // Recalculate average rating on Service
  const serviceReviews = await Review.find({
    service: review.service,
    isApproved: true
  });
  const avg =
    serviceReviews.length > 0
      ? serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length
      : 5.0;

  await Service.findByIdAndUpdate(review.service, {
    ratingAverage: parseFloat(avg.toFixed(1)),
    ratingCount: serviceReviews.length
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      review,
      `Review has been ${review.isApproved ? 'Approved & Visible' : 'Hidden from public'}`
    )
  );
});

/**
 * Admin: Delete inappropriate review
 */
export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new ApiError(404, 'Review not found');

  // Recalculate average rating on Service
  const serviceReviews = await Review.find({
    service: review.service,
    isApproved: true
  });
  const avg =
    serviceReviews.length > 0
      ? serviceReviews.reduce((sum, r) => sum + r.rating, 0) / serviceReviews.length
      : 5.0;

  await Service.findByIdAndUpdate(review.service, {
    ratingAverage: parseFloat(avg.toFixed(1)),
    ratingCount: serviceReviews.length
  });

  return res.status(200).json(
    new ApiResponse(200, null, 'Review permanently removed')
  );
});

