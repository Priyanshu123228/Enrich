import { Inquiry } from '../models/Inquiry.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { emailService } from '../services/email.service.js';

/**
 * @desc    Submit a new customer inquiry (Public)
 * @route   POST /api/inquiries
 * @access  Public
 */
export const createInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  // 1. Validation
  if (!name || !name.trim()) {
    throw new ApiError(400, 'Please provide your full name');
  }

  if (!email || !email.trim()) {
    throw new ApiError(400, 'Please provide your email address');
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email.trim())) {
    throw new ApiError(400, 'Please provide a valid email address');
  }

  if (!message || !message.trim()) {
    throw new ApiError(400, 'Please write your message or inquiry');
  }

  // 2. Create Inquiry record in MongoDB
  const inquiry = await Inquiry.create({
    name: name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone ? phone.trim() : '',
    message: message.trim(),
    status: 'unread',
    ipAddress: req.ip || req.headers['x-forwarded-for'] || '',
    userAgent: req.headers['user-agent'] || ''
  });

  // 3. Asynchronously send notifications (Non-blocking so response is fast)
  Promise.allSettled([
    emailService.sendInquiryAdminNotificationEmail(inquiry),
    emailService.sendInquiryCustomerAcknowledgmentEmail(inquiry)
  ]).then((results) => {
    results.forEach((r, idx) => {
      if (r.status === 'rejected') {
        console.warn(`[Inquiry Email Notice] Notification ${idx === 0 ? 'Admin' : 'Customer'} email failed:`, r.reason);
      }
    });
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      inquiry,
      'Thank you for contacting Enrich Beauty Parlour! Your inquiry has been received.'
    )
  );
});

/**
 * @desc    Get all inquiries with filters & pagination (Admin only)
 * @route   GET /api/inquiries
 * @access  Private/Admin
 */
export const getInquiries = asyncHandler(async (req, res) => {
  const {
    status,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  const query = {};

  // Status Filter
  if (status && status !== 'all') {
    query.status = status;
  }

  // Search Filter
  if (search && search.trim()) {
    const s = search.trim();
    query.$or = [
      { name: { $regex: s, $options: 'i' } },
      { email: { $regex: s, $options: 'i' } },
      { phone: { $regex: s, $options: 'i' } },
      { message: { $regex: s, $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [inquiries, total, unreadCount] = await Promise.all([
    Inquiry.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
    Inquiry.countDocuments(query),
    Inquiry.countDocuments({ status: 'unread' })
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        inquiries,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum) || 1
        },
        unreadCount
      },
      'Inquiries retrieved successfully'
    )
  );
});

/**
 * @desc    Get single inquiry by ID (Admin only)
 * @route   GET /api/inquiries/:id
 * @access  Private/Admin
 */
export const getInquiryById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const inquiry = await Inquiry.findById(id);

  if (!inquiry) {
    throw new ApiError(404, 'Inquiry not found');
  }

  // Auto-mark as read if opened while unread
  if (inquiry.status === 'unread') {
    inquiry.status = 'read';
    await inquiry.save();
  }

  return res.status(200).json(
    new ApiResponse(200, inquiry, 'Inquiry details retrieved')
  );
});

/**
 * @desc    Update inquiry status & admin notes (Admin only)
 * @route   PATCH /api/inquiries/:id/status
 * @access  Private/Admin
 */
export const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const validStatuses = ['unread', 'read', 'replied', 'archived'];
  if (status && !validStatuses.includes(status)) {
    throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const updateFields = {};
  if (status) {
    updateFields.status = status;
    if (status === 'replied') {
      updateFields.repliedAt = new Date();
    }
  }

  if (typeof adminNotes === 'string') {
    updateFields.adminNotes = adminNotes.trim();
  }

  const inquiry = await Inquiry.findByIdAndUpdate(
    id,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!inquiry) {
    throw new ApiError(404, 'Inquiry not found');
  }

  return res.status(200).json(
    new ApiResponse(200, inquiry, 'Inquiry status updated successfully')
  );
});

/**
 * @desc    Delete inquiry (Admin only)
 * @route   DELETE /api/inquiries/:id
 * @access  Private/Admin
 */
export const deleteInquiry = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const inquiry = await Inquiry.findByIdAndDelete(id);

  if (!inquiry) {
    throw new ApiError(404, 'Inquiry not found');
  }

  return res.status(200).json(
    new ApiResponse(200, null, 'Inquiry deleted successfully')
  );
});
