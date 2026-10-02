import crypto from 'crypto';
import { Payment } from '../models/Payment.js';
import { Appointment } from '../models/Appointment.js';
import { getRazorpayInstance, getRazorpayKeyId } from '../config/razorpay.js';
import { emailService } from '../services/email.service.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * @desc    Create a new Razorpay Order for an appointment
 * @route   POST /api/v1/payments/create-order
 * @access  Private / Customer
 */
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { appointmentId } = req.body;

  if (!appointmentId) {
    throw new ApiError(400, 'Appointment ID is required to initiate payment');
  }

  const appointment = await Appointment.findById(appointmentId)
    .populate('service', 'name price discountPrice')
    .populate('staff', 'name')
    .populate('customer', 'name email phone');

  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  // Authorization check: Customer can only pay for their own booking
  if (
    req.user.role !== 'admin' &&
    appointment.customer._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'Unauthorized to pay for this appointment');
  }

  if (appointment.paymentStatus === 'paid') {
    throw new ApiError(400, 'This appointment has already been paid for');
  }

  if (appointment.status === 'cancelled') {
    throw new ApiError(400, 'Cannot make payment for a cancelled appointment');
  }

  // Razorpay accepts amount in subunits (e.g. Paise for INR, 1 INR = 100 paise)
  const amountInPaise = Math.round(appointment.finalAmount * 100);
  const currency = 'INR';
  const receipt = `rcpt_${appointment.bookingId}_${Date.now().toString().slice(-6)}`;

  const razorpay = getRazorpayInstance();

  let order;
  try {
    order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        appointmentId: appointment._id.toString(),
        bookingId: appointment.bookingId,
        customerName: req.user.name,
        serviceName: appointment.service?.name || 'Salon Treatment'
      }
    });
  } catch (err) {
    console.error('Razorpay Order Creation Error:', err);
    throw new ApiError(500, `Failed to create Razorpay payment order: ${err.message}`);
  }

  // Record or update Payment in database
  let payment = await Payment.findOne({ appointment: appointment._id, status: 'pending' });

  if (payment) {
    payment.razorpayOrderId = order.id;
    payment.amount = appointment.finalAmount;
    payment.currency = currency;
    payment.receipt = receipt;
    await payment.save();
  } else {
    payment = await Payment.create({
      appointment: appointment._id,
      customer: req.user._id,
      amount: appointment.finalAmount,
      currency,
      razorpayOrderId: order.id,
      status: 'pending',
      receipt
    });
  }

  // Link payment and orderId on appointment
  appointment.payment = payment._id;
  appointment.razorpayOrderId = order.id;
  await appointment.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: getRazorpayKeyId(),
        appointment: {
          _id: appointment._id,
          bookingId: appointment.bookingId,
          finalAmount: appointment.finalAmount,
          serviceName: appointment.service?.name,
          date: appointment.date,
          startTime: appointment.startTime
        },
        customer: {
          name: req.user.name,
          email: req.user.email,
          phone: req.user.phone || ''
        }
      },
      'Razorpay order created successfully'
    )
  );
});

/**
 * @desc    Verify Razorpay payment signature & confirm booking
 * @route   POST /api/v1/payments/verify
 * @access  Private / Customer
 */
export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    appointmentId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    paymentMethod
  } = req.body;

  if (!appointmentId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new ApiError(400, 'Missing payment verification parameters');
  }

  const appointment = await Appointment.findById(appointmentId).populate('service staff customer');
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found');
  }

  const secret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!secret) {
    throw new ApiError(500, 'RAZORPAY_KEY_SECRET is missing in server environment');
  }

  // Server-side HMAC SHA256 Signature Verification
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  const isSignatureValid = generatedSignature === razorpay_signature;

  if (!isSignatureValid) {
    // Record payment failure on tampering / invalid signature
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'failed',
        failureReason: 'Cryptographic signature mismatch. Potential security tamper detected.'
      }
    );

    appointment.paymentStatus = 'failed';
    await appointment.save();

    throw new ApiError(400, 'Payment verification failed: Signature is invalid');
  }

  // Update Payment record to Paid
  const payment = await Payment.findOneAndUpdate(
    { razorpayOrderId: razorpay_order_id },
    {
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'paid',
      paymentMethod: paymentMethod || 'online'
    },
    { new: true, upsert: true }
  );

  // Update Appointment status to confirmed and paymentStatus to paid
  appointment.paymentStatus = 'paid';
  appointment.status = 'confirmed';
  appointment.razorpayPaymentId = razorpay_payment_id;
  appointment.payment = payment._id;
  await appointment.save();

  // Dispatch Non-blocking Payment Receipt Email
  emailService.sendPaymentConfirmationEmail(appointment, payment).catch((err) => {
    console.error('Payment receipt email error:', err);
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        paymentId: payment._id,
        bookingId: appointment.bookingId,
        paymentStatus: appointment.paymentStatus,
        appointmentStatus: appointment.status,
        razorpayPaymentId: razorpay_payment_id,
        amount: payment.amount,
        currency: payment.currency,
        receipt: payment.receipt
      },
      'Payment verified successfully! Your appointment is confirmed.'
    )
  );
});

/**
 * @desc    Record client-side payment cancellation or failure
 * @route   POST /api/v1/payments/failure
 * @access  Private / Customer
 */
export const handlePaymentFailure = asyncHandler(async (req, res) => {
  const {
    appointmentId,
    razorpay_order_id,
    error_code,
    error_description,
    error_reason
  } = req.body;

  const failureMessage = error_description || error_reason || 'Payment cancelled or failed by user';

  if (razorpay_order_id) {
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'failed',
        failureReason: `${error_code ? `[${error_code}] ` : ''}${failureMessage}`
      }
    );
  }

  if (appointmentId) {
    await Appointment.findByIdAndUpdate(appointmentId, {
      paymentStatus: 'failed'
    });
  }

  return res.status(200).json(
    new ApiResponse(200, { status: 'failed', reason: failureMessage }, 'Payment failure logged')
  );
});

/**
 * @desc    Get payment details and invoice for an appointment
 * @route   GET /api/v1/payments/appointment/:appointmentId
 * @access  Private / Customer & Admin
 */
export const getPaymentByAppointment = asyncHandler(async (req, res) => {
  const { appointmentId } = req.params;

  const payment = await Payment.findOne({ appointment: appointmentId })
    .populate('appointment')
    .populate('customer', 'name email phone');

  if (!payment) {
    throw new ApiError(404, 'No payment record found for this appointment');
  }

  // Authorization check
  if (
    req.user.role !== 'admin' &&
    payment.customer._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, 'Unauthorized access to payment details');
  }

  return res.status(200).json(
    new ApiResponse(200, payment, 'Payment record retrieved successfully')
  );
});

/**
 * @desc    Refund a paid transaction (Admin only)
 * @route   POST /api/v1/payments/:id/refund
 * @access  Private / Admin
 */
export const refundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  const payment = await Payment.findById(id).populate('appointment');
  if (!payment) {
    throw new ApiError(404, 'Payment record not found');
  }

  if (payment.status !== 'paid') {
    throw new ApiError(400, `Cannot refund payment with status '${payment.status}'`);
  }

  if (!payment.razorpayPaymentId) {
    throw new ApiError(400, 'Razorpay Payment ID is missing on this record');
  }

  const refundAmount = amount ? Number(amount) : payment.amount;
  const refundAmountPaise = Math.round(refundAmount * 100);

  const razorpay = getRazorpayInstance();

  let refund;
  try {
    refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: refundAmountPaise,
      notes: {
        reason: reason || 'Salon appointment cancellation refund',
        adminId: req.user._id.toString()
      }
    });
  } catch (err) {
    console.error('Razorpay Refund Error:', err);
    throw new ApiError(500, `Razorpay refund failed: ${err.message}`);
  }

  payment.status = 'refunded';
  payment.refundId = refund.id;
  payment.refundAmount = refundAmount;
  payment.refundedAt = new Date();
  await payment.save();

  if (payment.appointment) {
    await Appointment.findByIdAndUpdate(payment.appointment._id, {
      paymentStatus: 'refunded',
      status: 'cancelled',
      cancellationReason: `Refund processed: ${reason || 'Admin cancelled and refunded'}`,
      cancelledAt: new Date(),
      cancelledBy: 'admin'
    });
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        refundId: refund.id,
        amount: refundAmount,
        status: payment.status
      },
      'Payment refund processed successfully'
    )
  );
});
