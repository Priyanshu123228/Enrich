import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { emailService } from '../services/email.service.js';
import { otpService } from '../services/otp.service.js';
import { smsService } from '../services/sms.service.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Format user payload without sensitive fields
 */
const formatUserResponse = (user) => {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status || (user.isActive ? 'active' : 'pending_verification'),
    isEmailVerified: !!user.isEmailVerified,
    isPhoneVerified: !!user.isPhoneVerified,
    avatar: user.avatar,
    isActive: user.isActive,
    isVerified: user.isVerified || user.isEmailVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

/**
 * @desc    Register a new customer account (Creates pending account & dispatches Email OTP)
 * @route   POST /api/v1/auth/signup | POST /api/v1/auth/register
 * @access  Public
 */
export const signup = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  const normalizedEmail = email.toLowerCase().trim();
  const trimmedPhone = phone.trim();

  // 1. Check if an active account already exists with this email or phone
  const existingUser = await User.findOne({
    $or: [{ email: normalizedEmail }, { phone: trimmedPhone }]
  });

  if (existingUser) {
    // If the account exists and is already active / email verified
    if (existingUser.isEmailVerified || existingUser.status === 'active') {
      if (existingUser.email === normalizedEmail) {
        throw new ApiError(409, 'An account with this email address already exists');
      }
      if (existingUser.phone === trimmedPhone) {
        throw new ApiError(409, 'An account with this phone number already exists');
      }
    }

    // If an unverified pending account exists with this email, update its details and resend OTP
    if (existingUser.email === normalizedEmail && !existingUser.isEmailVerified) {
      existingUser.name = name.trim();
      existingUser.phone = trimmedPhone;
      existingUser.password = password; // Pre-save hook will hash it
      await existingUser.save();

      // Generate and dispatch fresh email OTP
      const { plainOtp, expiryMinutes } = await otpService.createOTP({
        userId: existingUser._id,
        type: 'email_verification',
        ignoreCooldown: true
      });

      await emailService.sendVerificationOTPEmail(existingUser, plainOtp, expiryMinutes);

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            userId: existingUser._id,
            email: existingUser.email
          },
          'A new 6-digit verification code has been sent to your email address.'
        )
      );
    }
  }

  // 2. Create pending user account (Strictly customer role)
  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    phone: trimmedPhone,
    password,
    role: 'customer',
    status: 'pending_verification',
    isEmailVerified: false,
    isPhoneVerified: false,
    isActive: true
  });

  // 3. Generate Cryptographic 6-Digit Email OTP
  const { plainOtp, expiryMinutes } = await otpService.createOTP({
    userId: user._id,
    type: 'email_verification',
    ignoreCooldown: true
  });

  // 4. Dispatch verification email
  await emailService.sendVerificationOTPEmail(user, plainOtp, expiryMinutes);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        userId: user._id,
        email: user.email
      },
      'Registration successful. Please enter the 6-digit verification code sent to your email.'
    )
  );
});

/**
 * @desc    Verify Email with 6-Digit OTP & Activate Account
 * @route   POST /api/v1/auth/verify-email
 * @access  Public
 */
export const verifyEmail = asyncHandler(async (req, res) => {
  const { userId, email, otp } = req.body;

  // 1. Locate user
  let user;
  if (userId) {
    user = await User.findById(userId);
  } else if (email) {
    user = await User.findOne({ email: email.toLowerCase().trim() });
  }

  if (!user) {
    throw new ApiError(404, 'User account not found');
  }

  if (user.isEmailVerified && user.status === 'active') {
    return res.status(200).json(
      new ApiResponse(200, { user: formatUserResponse(user) }, 'Email is already verified. You may sign in.')
    );
  }

  // 2. Cryptographically verify OTP
  await otpService.verifyOTP({
    userId: user._id,
    type: 'email_verification',
    enteredOtp: otp
  });

  // 3. Activate account
  user.isEmailVerified = true;
  user.isVerified = true;
  user.status = 'active';
  user.isActive = true;
  await user.save();

  // 4. Send Welcome Email in background
  emailService.sendWelcomeEmail(user).catch((err) => {
    console.error('Welcome email error:', err.message);
  });

  // 5. Generate JWT token for seamless login
  const token = user.generateAccessToken();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: formatUserResponse(user),
        token
      },
      'Email verified successfully. Welcome to Enrich Salon!'
    )
  );
});

/**
 * @desc    Resend Email Verification OTP
 * @route   POST /api/v1/auth/resend-email-otp
 * @access  Public
 */
export const resendEmailOTP = asyncHandler(async (req, res) => {
  const { userId, email } = req.body;

  let user;
  if (userId) {
    user = await User.findById(userId);
  } else if (email) {
    user = await User.findOne({ email: email.toLowerCase().trim() });
  }

  if (!user) {
    throw new ApiError(404, 'Account not found with provided details');
  }

  if (user.isEmailVerified) {
    return res.status(400).json(
      new ApiResponse(400, null, 'Email is already verified. Please sign in.')
    );
  }

  // Generate new OTP (Enforces 45s cooldown)
  const { plainOtp, expiryMinutes } = await otpService.createOTP({
    userId: user._id,
    type: 'email_verification'
  });

  // Dispatch email
  await emailService.sendVerificationOTPEmail(user, plainOtp, expiryMinutes);

  return res.status(200).json(
    new ApiResponse(200, null, 'A new verification code has been sent to your email.')
  );
});

/**
 * @desc    Authenticate user and get JWT token
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const identifier = email.toLowerCase().trim();

  // 1. Find user by email or phone
  const user = await User.findOne({
    $or: [{ email: identifier }, { phone: identifier }]
  }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid credentials: User not found');
  }

  // 2. Check if account is suspended
  if (user.status === 'suspended' || !user.isActive) {
    throw new ApiError(403, 'Your account has been suspended or deactivated. Please contact support.');
  }

  // 3. Verify password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials: Incorrect password');
  }

  // 4. Verify that email is verified
  if (!user.isEmailVerified || user.status === 'pending_verification') {
    // Send a fresh OTP automatically for convenience
    try {
      const { plainOtp, expiryMinutes } = await otpService.createOTP({
        userId: user._id,
        type: 'email_verification',
        ignoreCooldown: true
      });
      emailService.sendVerificationOTPEmail(user, plainOtp, expiryMinutes).catch(() => {});
    } catch {
      // Ignore if OTP creation fails
    }

    return res.status(403).json({
      success: false,
      statusCode: 403,
      message: 'Please verify your email address before logging in. A new verification code has been sent.',
      data: {
        isEmailVerified: false,
        email: user.email,
        userId: user._id
      }
    });
  }

  // 5. Generate JWT Token
  const token = user.generateAccessToken();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: formatUserResponse(user),
        token
      },
      'Logged in successfully'
    )
  );
});

/**
 * @desc    Forgot Password (Initiate password reset OTP - Account enumeration safe)
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  // Generic response to prevent account enumeration
  const genericMessage = 'If an account exists with this email address, a 6-digit password reset code has been sent.';

  if (!user) {
    return res.status(200).json(new ApiResponse(200, { email: normalizedEmail }, genericMessage));
  }

  // Generate password reset OTP
  const { plainOtp, expiryMinutes } = await otpService.createOTP({
    userId: user._id,
    type: 'password_reset'
  });

  // Dispatch password reset email
  await emailService.sendPasswordResetOTPEmail(user, plainOtp, expiryMinutes);

  return res.status(200).json(new ApiResponse(200, { email: normalizedEmail }, genericMessage));
});

/**
 * @desc    Verify Password Reset OTP
 * @route   POST /api/v1/auth/verify-reset-otp
 * @access  Public
 */
export const verifyResetOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset request.');
  }

  // Check OTP validity
  await otpService.verifyOTP({
    userId: user._id,
    type: 'password_reset',
    enteredOtp: otp
  });

  // Generate verified reset token valid for 15 minutes
  const resetToken = jwt.sign(
    { userId: user._id, email: normalizedEmail, purpose: 'password_reset' },
    process.env.JWT_SECRET || 'default_jwt_secret',
    { expiresIn: '15m' }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      { email: normalizedEmail, verified: true, resetToken },
      'Reset code verified successfully. Please enter your new password.'
    )
  );
});

/**
 * @desc    Reset Password with New Password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, resetToken, newPassword } = req.body;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    throw new ApiError(400, 'Invalid or expired password reset request.');
  }

  let isAuthorized = false;

  // 1. Verify resetToken if provided
  if (resetToken) {
    try {
      const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || 'default_jwt_secret');
      if (decoded.email === normalizedEmail && decoded.purpose === 'password_reset') {
        isAuthorized = true;
      }
    } catch {
      // Fallback to OTP check if token expired
    }
  }

  // 2. If no valid resetToken, verify OTP directly
  if (!isAuthorized) {
    if (!otp) {
      throw new ApiError(400, 'Verification code or valid reset session is required.');
    }
    await otpService.verifyOTP({
      userId: user._id,
      type: 'password_reset',
      enteredOtp: otp
    });
  }

  // Update password (pre-save hook will hash it)
  user.password = newPassword;
  await user.save();

  // Invalidate any remaining reset OTPs
  await otpService.invalidateOTP({ userId: user._id, type: 'password_reset' });

  return res.status(200).json(
    new ApiResponse(200, null, 'Your password has been reset successfully. You can now log in.')
  );
});

/**
 * @desc    Send Phone Verification OTP via SMS
 * @route   POST /api/v1/auth/send-phone-otp
 * @access  Private
 */
export const sendPhoneOTP = asyncHandler(async (req, res) => {
  const user = req.user;
  const phone = req.body.phone?.trim() || user.phone;

  if (!phone) {
    throw new ApiError(400, 'Phone number is required');
  }

  // If phone changed, verify uniqueness
  if (phone !== user.phone) {
    const existing = await User.findOne({ phone, _id: { $ne: user._id } });
    if (existing) {
      throw new ApiError(409, 'This phone number is already registered with another account');
    }
    user.phone = phone;
    user.isPhoneVerified = false;
    await user.save();
  }

  if (user.isPhoneVerified && phone === user.phone) {
    return res.status(200).json(
      new ApiResponse(200, { isPhoneVerified: true }, 'Phone number is already verified.')
    );
  }

  // Generate Phone OTP
  const { plainOtp } = await otpService.createOTP({
    userId: user._id,
    type: 'phone_verification'
  });

  // Dispatch SMS
  await smsService.sendPhoneOTP({
    phone,
    otp: plainOtp,
    userName: user.name
  });

  return res.status(200).json(
    new ApiResponse(200, { phone }, 'A 6-digit verification code has been sent via SMS to your phone number.')
  );
});

/**
 * @desc    Verify Phone Number with OTP
 * @route   POST /api/v1/auth/verify-phone
 * @access  Private
 */
export const verifyPhone = asyncHandler(async (req, res) => {
  const { otp } = req.body;
  const user = req.user;

  // 1. Verify via SMS provider if Twilio Verify is active
  const checkResult = await smsService.verifyPhoneOTP({
    phone: user.phone,
    otp
  });

  // 2. If provider check was not active or returned local check required, verify against local DB
  if (checkResult.useLocalCheck) {
    await otpService.verifyOTP({
      userId: user._id,
      type: 'phone_verification',
      enteredOtp: otp
    });
  }

  // Mark phone as verified
  user.isPhoneVerified = true;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, { user: formatUserResponse(user) }, 'Phone number verified successfully.')
  );
});

/**
 * @desc    Resend Phone OTP
 * @route   POST /api/v1/auth/resend-phone-otp
 * @access  Private
 */
export const resendPhoneOTP = asyncHandler(async (req, res) => {
  const user = req.user;
  const phone = req.body.phone?.trim() || user.phone;

  if (user.isPhoneVerified && phone === user.phone) {
    return res.status(400).json(
      new ApiResponse(400, null, 'Phone number is already verified.')
    );
  }

  // Generate OTP (Rate-limit enforced)
  const { plainOtp } = await otpService.createOTP({
    userId: user._id,
    type: 'phone_verification'
  });

  // Dispatch SMS
  await smsService.sendPhoneOTP({
    phone,
    otp: plainOtp,
    userName: user.name
  });

  return res.status(200).json(
    new ApiResponse(200, null, 'A new verification code has been sent to your phone number.')
  );
});

/**
 * @desc    Get currently logged in user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, formatUserResponse(req.user), 'User profile fetched successfully')
  );
});

/**
 * @desc    Update user profile (Name, phone, avatar)
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = req.user;

  if (phone && phone !== user.phone) {
    const existingPhone = await User.findOne({ phone, _id: { $ne: user._id } });
    if (existingPhone) {
      throw new ApiError(409, 'This phone number is already registered to another account');
    }
    user.phone = phone;
    user.isPhoneVerified = false; // Reset phone verification on change
  }

  if (name) user.name = name;
  if (avatar) user.avatar = avatar;

  await user.save();

  return res.status(200).json(
    new ApiResponse(200, formatUserResponse(user), 'Profile updated successfully')
  );
});

/**
 * @desc    Change password
 * @route   PUT /api/v1/auth/change-password
 * @access  Private
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  const isMatch = await user.isPasswordCorrect(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Current password does not match');
  }

  user.password = newPassword;
  await user.save();

  return res.status(200).json(
    new ApiResponse(200, null, 'Password changed successfully')
  );
});

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Public / Private
 */
export const logout = asyncHandler(async (req, res) => {
  return res.status(200).json(
    new ApiResponse(200, null, 'Logged out successfully')
  );
});
