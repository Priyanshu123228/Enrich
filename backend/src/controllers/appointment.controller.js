import { Appointment } from '../models/Appointment.js';
import { Service } from '../models/Service.js';
import { Staff } from '../models/Staff.js';
import { Offer } from '../models/Offer.js';
import { emailService } from '../services/email.service.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  checkSlotCollision,
  calculateEndTime,
  getAvailableSlots,
  timeToMinutes,
  isIntervalOverlap
} from '../services/slot.service.js';

/**
 * Helper to generate human-readable unique booking ID e.g. "LX-2026-84920"
 */
const generateBookingId = () => {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  return `LX-${new Date().getFullYear()}-${randomDigits}`;
};

/**
 * @desc    Create a new appointment reservation
 * @route   POST /api/v1/appointments
 * @access  Private / Customer
 */
export const createAppointment = asyncHandler(async (req, res) => {
  const { serviceId, staffId, date, startTime, notes, promoCode } = req.body;
  const customerId = req.user._id;

  // 0. Verify customer email & phone verification status
  if (!req.user.isEmailVerified) {
    throw new ApiError(
      403,
      'Email verification is required before booking an appointment. Please verify your email address.',
      { requiresEmailVerification: true }
    );
  }
  if (!req.user.isPhoneVerified) {
    throw new ApiError(
      403,
      'Phone verification is required before booking an appointment. Please verify your phone number.',
      { requiresPhoneVerification: true }
    );
  }

  // 1. Validate Date (Prevent past bookings)
  const bookingDate = new Date(`${date}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    throw new ApiError(400, 'Cannot book appointments for past dates');
  }

  const isToday =
    today.getFullYear() === bookingDate.getFullYear() &&
    today.getMonth() === bookingDate.getMonth() &&
    today.getDate() === bookingDate.getDate();

  if (isToday) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const slotMinutes = timeToMinutes(startTime);
    if (slotMinutes <= currentMinutes) {
      throw new ApiError(400, 'Cannot book a time slot in the past');
    }
  }

  // 2. Fetch Service
  const service = await Service.findById(serviceId);
  if (!service || !service.isActive) {
    throw new ApiError(404, 'Selected service is no longer available');
  }

  // 3. Determine Staff
  let targetStaffId = staffId;
  if (!targetStaffId || targetStaffId === 'any') {
    // Auto-select first available qualified staff for this slot
    const slotCheck = await getAvailableSlots({ serviceId, date });
    const matchingSlot = slotCheck.availableSlots.find((s) => s.time === startTime);
    if (!matchingSlot || matchingSlot.availableStaff.length === 0) {
      throw new ApiError(409, 'No beauticians are available for the selected time slot');
    }
    targetStaffId = matchingSlot.availableStaff[0]._id;
  }

  const staff = await Staff.findById(targetStaffId);
  if (!staff || staff.status !== 'active') {
    throw new ApiError(404, 'Selected beautician is currently unavailable');
  }

  // 4. Verify Staff Working Schedule on this Day of Week
  const dayOfWeek = bookingDate.getDay();
  const shift = staff.schedule?.find((s) => s.dayOfWeek === dayOfWeek);
  if (!shift || !shift.isWorking) {
    throw new ApiError(400, `${staff.name} is off duty on ${date}`);
  }

  // Check leave exception
  const isExceptionOff = staff.exceptions?.some(
    (exc) => exc.date === date && exc.isOff
  );
  if (isExceptionOff) {
    throw new ApiError(400, `${staff.name} is on leave on ${date}`);
  }

  // Check shift start/end time and break windows
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + service.duration;
  const shiftStart = timeToMinutes(shift.startTime || '09:00');
  const shiftEnd = timeToMinutes(shift.endTime || '19:00');
  const breakStart = timeToMinutes(shift.breakStartTime || '13:00');
  const breakEnd = timeToMinutes(shift.breakEndTime || '14:00');

  if (startMins < shiftStart || endMins > shiftEnd) {
    throw new ApiError(
      400,
      `Selected time (${startTime} - ${calculateEndTime(startTime, service.duration)}) is outside of ${staff.name}'s working shift (${shift.startTime} - ${shift.endTime})`
    );
  }

  if (breakStart && breakEnd && isIntervalOverlap(startMins, endMins, breakStart, breakEnd)) {
    throw new ApiError(
      400,
      `Selected time conflicts with ${staff.name}'s break window (${shift.breakStartTime} - ${shift.breakEndTime})`
    );
  }

  // 5. Concurrency / Collision Check
  const { isCollision, endTime } = await checkSlotCollision({
    staffId: targetStaffId,
    date,
    startTime,
    duration: service.duration
  });

  if (isCollision) {
    throw new ApiError(
      409,
      'Double Booking Conflict: This time slot was just booked by another client. Please select another slot.'
    );
  }

  const price = service.price;
  let finalAmount = service.discountPrice > 0 ? service.discountPrice : service.price;

  // 6. Calculate discount if promoCode provided
  if (promoCode) {
    const offer = await Offer.findOne({
      code: promoCode.toUpperCase().trim(),
      isActive: true,
      endDate: { $gte: new Date() }
    });

    if (offer && finalAmount >= offer.minBookingAmount) {
      let discount = 0;
      if (offer.discountType === 'percentage') {
        discount = (finalAmount * offer.discountValue) / 100;
        if (offer.maxDiscountAmount && discount > offer.maxDiscountAmount) {
          discount = offer.maxDiscountAmount;
        }
      } else {
        discount = offer.discountValue;
      }
      finalAmount = Math.max(0, finalAmount - discount);
      offer.usedCount = (offer.usedCount || 0) + 1;
      await offer.save();
    }
  }

  // 7. Create Appointment
  const appointment = await Appointment.create({
    bookingId: generateBookingId(),
    customer: customerId,
    service: service._id,
    staff: staff._id,
    date,
    startTime,
    endTime,
    duration: service.duration,
    price,
    finalAmount,
    notes: notes || '',
    status: 'confirmed'
  });

  const populated = await Appointment.findById(appointment._id)
    .populate('service', 'name category price duration images')
    .populate('staff', 'name avatar phone email')
    .populate('customer', 'name email phone');

  // 8. Dispatch Non-blocking Appointment Confirmation Email
  emailService.sendAppointmentConfirmationEmail(populated).catch((err) => {
    console.error('Email send error:', err);
  });

  return res.status(201).json(
    new ApiResponse(201, populated, 'Appointment booked successfully!')
  );
});

/**
 * @desc    Get single appointment details by ID
 * @route   GET /api/v1/appointments/:id
 * @access  Private / Customer, Staff, Admin (Strict IDOR Protected)
 */
export const getAppointmentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id)
    .populate('service', 'name category price duration images')
    .populate('staff', 'name avatar phone email')
    .populate('customer', 'name email phone')
    .populate('payment');

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  // IDOR Protection: Customers can ONLY access their own appointments
  if (
    req.user.role !== 'admin' &&
    req.user.role !== 'staff' &&
    appointment.customer._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'Unauthorized: Access to this appointment is denied');
  }

  return res.status(200).json(
    new ApiResponse(200, appointment, 'Appointment details fetched successfully')
  );
});

/**
 * @desc    Get logged in customer's appointments
 * @route   GET /api/v1/appointments/my
 * @access  Private / Customer
 */
export const getMyAppointments = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const { status } = req.query;

  const filter = { customer: customerId };
  if (status && status !== 'all') {
    filter.status = status;
  }

  const appointments = await Appointment.find(filter)
    .populate('service', 'name category price duration images')
    .populate('staff', 'name avatar phone')
    .populate('payment')
    .sort({ date: -1, startTime: -1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, appointments, 'Your appointments fetched successfully')
  );
});

/**
 * @desc    Cancel an appointment
 * @route   PUT /api/v1/appointments/:id/cancel
 * @access  Private / Customer or Admin
 */
export const cancelAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const user = req.user;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  // Verify ownership or Admin role
  if (
    appointment.customer.toString() !== user._id.toString() &&
    user.role !== 'admin'
  ) {
    throw new ApiError(403, 'Unauthorized to cancel this appointment');
  }

  if (appointment.status === 'cancelled') {
    throw new ApiError(400, 'This appointment is already cancelled');
  }

  appointment.status = 'cancelled';
  appointment.cancellationReason = reason || 'Cancelled by user';
  appointment.cancelledAt = new Date();
  appointment.cancelledBy = user.role;

  await appointment.save();

  const populated = await Appointment.findById(appointment._id)
    .populate('service', 'name category price duration')
    .populate('staff', 'name avatar phone email')
    .populate('customer', 'name email phone');

  // Dispatch Non-blocking Cancellation Email
  emailService.sendAppointmentCancellationEmail(populated, reason).catch((err) => {
    console.error('Cancellation email error:', err);
  });

  return res.status(200).json(
    new ApiResponse(200, populated, 'Appointment cancelled successfully')
  );
});

/**
 * @desc    Reschedule appointment date and time slot
 * @route   PUT /api/v1/appointments/:id/reschedule
 * @access  Private / Customer or Admin
 */
export const rescheduleAppointment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { newDate, newStartTime } = req.body;
  const user = req.user;

  const appointment = await Appointment.findById(id).populate('service');
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  if (
    appointment.customer.toString() !== user._id.toString() &&
    user.role !== 'admin'
  ) {
    throw new ApiError(403, 'Unauthorized to reschedule this appointment');
  }

  // Validate Reschedule Date (Cannot reschedule to past date)
  const bookingDate = new Date(`${newDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (bookingDate < today) {
    throw new ApiError(400, 'Cannot reschedule appointments to past dates');
  }

  const isToday =
    today.getFullYear() === bookingDate.getFullYear() &&
    today.getMonth() === bookingDate.getMonth() &&
    today.getDate() === bookingDate.getDate();

  if (isToday) {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const slotMinutes = timeToMinutes(newStartTime);
    if (slotMinutes <= currentMinutes) {
      throw new ApiError(400, 'Cannot reschedule to a time slot in the past');
    }
  }

  // Verify staff availability on new date
  const staff = await Staff.findById(appointment.staff);
  if (!staff || staff.status !== 'active') {
    throw new ApiError(400, 'Assigned stylist is currently unavailable');
  }

  const dayOfWeek = bookingDate.getDay();
  const shift = staff.schedule?.find((s) => s.dayOfWeek === dayOfWeek);
  if (!shift || !shift.isWorking) {
    throw new ApiError(400, `${staff.name} is off duty on ${newDate}`);
  }

  // Check collision on the new date and slot
  const { isCollision, endTime } = await checkSlotCollision({
    staffId: appointment.staff,
    date: newDate,
    startTime: newStartTime,
    duration: appointment.duration,
    excludeAppointmentId: appointment._id
  });

  if (isCollision) {
    throw new ApiError(409, 'Selected rescheduled slot is not available');
  }

  const oldDate = appointment.date;
  const oldStartTime = appointment.startTime;

  appointment.date = newDate;
  appointment.startTime = newStartTime;
  appointment.endTime = endTime;
  appointment.status = 'confirmed';
  await appointment.save();

  const populated = await Appointment.findById(appointment._id)
    .populate('service', 'name category price duration')
    .populate('staff', 'name avatar phone email')
    .populate('customer', 'name email phone');

  // Dispatch Non-blocking Rescheduled Email
  emailService.sendAppointmentRescheduledEmail(populated, {
    date: oldDate,
    startTime: oldStartTime
  }).catch((err) => {
    console.error('Reschedule email error:', err);
  });

  return res.status(200).json(
    new ApiResponse(200, populated, 'Appointment rescheduled successfully')
  );
});

/**
 * @desc    Send / Trigger Appointment Reminder Email
 * @route   POST /api/v1/appointments/:id/reminder
 * @access  Private / Admin or Customer
 */
export const sendAppointmentReminder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const appointment = await Appointment.findById(id)
    .populate('service', 'name category price duration')
    .populate('staff', 'name avatar phone email')
    .populate('customer', 'name email phone');

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  const result = await emailService.sendAppointmentReminderEmail(appointment);

  return res.status(200).json(
    new ApiResponse(200, result, `Reminder email sent to ${appointment.customer?.email}`)
  );
});

/**
 * @desc    Admin: Get all appointments with filters & pagination
 * @route   GET /api/v1/appointments/admin/all
 * @access  Private / Admin
 */
export const getAllAppointments = asyncHandler(async (req, res) => {
  const { status, date, staffId, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (status && status !== 'all') filter.status = status;
  if (date) filter.date = date;
  if (staffId && staffId !== 'all') filter.staff = staffId;

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.max(1, parseInt(limit, 10));
  const skip = (pageNum - 1) * limitNum;

  const [appointments, total] = await Promise.all([
    Appointment.find(filter)
      .populate('service', 'name category price duration')
      .populate('staff', 'name avatar phone')
      .populate('customer', 'name email phone')
      .populate('payment')
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Appointment.countDocuments(filter)
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        appointments,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      },
      'All appointments fetched successfully'
    )
  );
});

/**
 * @desc    Admin: Update appointment status (confirm, complete, cancel)
 * @route   PUT /api/v1/appointments/:id/status
 * @access  Private / Admin
 */
export const updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const appointment = await Appointment.findById(id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  appointment.status = status;
  await appointment.save();

  return res.status(200).json(
    new ApiResponse(200, appointment, `Appointment marked as ${status}`)
  );
});

/**
 * @desc    Staff: Get assigned appointments schedule
 * @route   GET /api/v1/appointments/staff/schedule
 * @access  Private / Staff or Admin
 */
export const getStaffSchedule = asyncHandler(async (req, res) => {
  const { staffId, date } = req.query;

  const filter = { status: { $in: ['confirmed', 'completed', 'pending'] } };
  if (staffId) filter.staff = staffId;
  if (date) filter.date = date;

  const schedule = await Appointment.find(filter)
    .populate('service', 'name category duration')
    .populate('customer', 'name phone')
    .sort({ startTime: 1 })
    .lean();

  return res.status(200).json(
    new ApiResponse(200, schedule, 'Staff schedule retrieved successfully')
  );
});
