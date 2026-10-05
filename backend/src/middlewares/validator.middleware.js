import { ApiError } from '../utils/apiError.js';

const EMAIL_REGEX = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
const OTP_REGEX = /^\d{6}$/;

/**
 * Validate Signup / Registration inputs
 */
export const validateSignup = (req, res, next) => {
  const { name, email, phone, password, confirmPassword } = req.body;
  const errors = [];

  if (!name || name.trim().length === 0) errors.push('Full name is required');
  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Valid email address is required');
  }
  if (!phone || phone.trim().length < 7) {
    errors.push('Valid phone number is required (min 7 digits)');
  }
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    errors.push('Password and confirm password do not match');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};

/**
 * Validate Verify Email OTP inputs
 */
export const validateVerifyEmailOTP = (req, res, next) => {
  const { userId, email, otp } = req.body;
  const errors = [];

  if (!userId && !email) {
    errors.push('User ID or registered email address is required');
  }
  if (!otp || !OTP_REGEX.test(otp.toString().trim())) {
    errors.push('A valid 6-digit verification code is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};

/**
 * Validate Resend Email OTP inputs
 */
export const validateResendEmailOTP = (req, res, next) => {
  const { userId, email } = req.body;
  const errors = [];

  if (!userId && !email) {
    errors.push('User ID or registered email address is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};

/**
 * Validate Login inputs
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || email.trim().length === 0) errors.push('Email or phone is required');
  if (!password || password.trim().length === 0) errors.push('Password is required');

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};

/**
 * Validate Forgot Password input
 */
export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const errors = [];

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Valid email address is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};

/**
 * Validate Verify Reset OTP input
 */
export const validateVerifyResetOTP = (req, res, next) => {
  const { email, otp } = req.body;
  const errors = [];

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Valid email address is required');
  }
  if (!otp || !OTP_REGEX.test(otp.toString().trim())) {
    errors.push('A valid 6-digit verification code is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};

/**
 * Validate Reset Password inputs
 */
export const validateResetPassword = (req, res, next) => {
  const { email, otp, resetToken, newPassword, confirmPassword } = req.body;
  const errors = [];

  if (!email || !EMAIL_REGEX.test(email.trim())) {
    errors.push('Valid email address is required');
  }
  if (!resetToken && (!otp || !OTP_REGEX.test(otp.toString().trim()))) {
    errors.push('A valid 6-digit verification code or verified reset session is required');
  }
  if (!newPassword || newPassword.length < 6) {
    errors.push('New password must be at least 6 characters long');
  }
  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    errors.push('New password and confirm password do not match');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};

/**
 * Validate Send / Verify Phone OTP inputs
 */
export const validatePhoneOTP = (req, res, next) => {
  const { phone } = req.body;
  // If user is logged in, phone can come from req.user
  if (!phone && !req.user?.phone) {
    return next(new ApiError(400, 'Phone number is required'));
  }
  next();
};

export const validateVerifyPhoneOTP = (req, res, next) => {
  const { otp } = req.body;
  if (!otp || !OTP_REGEX.test(otp.toString().trim())) {
    return next(new ApiError(400, 'A valid 6-digit verification code is required'));
  }
  next();
};

/**
 * Validate Profile Update inputs
 */
export const validateProfileUpdate = (req, res, next) => {
  const { name, phone } = req.body;
  const errors = [];

  if (name !== undefined && name.trim().length === 0) {
    errors.push('Name cannot be empty');
  }
  if (phone !== undefined && phone.trim().length < 7) {
    errors.push('Valid phone number is required');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};

/**
 * Validate Change Password inputs
 */
export const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) errors.push('Current password is required');
  if (!newPassword || newPassword.length < 6) {
    errors.push('New password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return next(new ApiError(400, 'Validation Error', errors));
  }

  next();
};
