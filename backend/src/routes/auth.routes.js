import { Router } from 'express';
import {
  signup,
  verifyEmail,
  resendEmailOTP,
  login,
  logout,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  sendPhoneOTP,
  verifyPhone,
  resendPhoneOTP,
  getCurrentUser,
  updateProfile,
  changePassword
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import {
  authLimiter,
  otpLimiter,
  passwordResetLimiter
} from '../middlewares/rateLimiter.middleware.js';
import {
  validateSignup,
  validateVerifyEmailOTP,
  validateResendEmailOTP,
  validateLogin,
  validateForgotPassword,
  validateVerifyResetOTP,
  validateResetPassword,
  validatePhoneOTP,
  validateVerifyPhoneOTP,
  validateProfileUpdate,
  validateChangePassword
} from '../middlewares/validator.middleware.js';

const router = Router();

// ==========================================
// 1. PUBLIC REGISTRATION & EMAIL VERIFICATION
// ==========================================
router.post('/signup', authLimiter, validateSignup, signup);
router.post('/register', authLimiter, validateSignup, signup);
router.post('/verify-email', otpLimiter, validateVerifyEmailOTP, verifyEmail);
router.post('/resend-email-otp', otpLimiter, validateResendEmailOTP, resendEmailOTP);

// ==========================================
// 2. AUTHENTICATION & SESSION
// ==========================================
router.post('/login', authLimiter, validateLogin, login);
router.post('/logout', logout);

// ==========================================
// 3. PASSWORD RESET FLOW
// ==========================================
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/verify-reset-otp', otpLimiter, validateVerifyResetOTP, verifyResetOTP);
router.post('/reset-password', passwordResetLimiter, validateResetPassword, resetPassword);

// ==========================================
// 4. PHONE NUMBER OTP VERIFICATION (AUTHENTICATED)
// ==========================================
router.post('/send-phone-otp', verifyJWT, otpLimiter, validatePhoneOTP, sendPhoneOTP);
router.post('/verify-phone', verifyJWT, otpLimiter, validateVerifyPhoneOTP, verifyPhone);
router.post('/resend-phone-otp', verifyJWT, otpLimiter, resendPhoneOTP);

// ==========================================
// 5. PROTECTED USER PROFILE & SETTINGS
// ==========================================
router.get('/me', verifyJWT, getCurrentUser);
router.put('/profile', verifyJWT, validateProfileUpdate, updateProfile);
router.put('/change-password', verifyJWT, validateChangePassword, changePassword);

export default router;
