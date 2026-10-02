import crypto from 'crypto';
import { VerificationOTP } from '../models/VerificationOTP.js';
import { ApiError } from '../utils/apiError.js';

/**
 * OTP Configuration Defaults
 */
const getOtpExpiryMinutes = () => Number(process.env.OTP_EXPIRY_MINUTES) || 5;
const getMaxOtpAttempts = () => Number(process.env.MAX_OTP_ATTEMPTS) || 5;
const getResendCooldownSeconds = () => Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 45;

export const otpService = {
  /**
   * 1. Cryptographically Secure 6-Digit OTP Generator
   * Uses crypto.randomInt(100000, 1000000) - NEVER Math.random()
   */
  generateOTP: () => {
    const num = crypto.randomInt(100000, 1000000);
    return num.toString();
  },

  /**
   * 2. Hash OTP using SHA-256
   */
  hashOTP: (otp) => {
    if (!otp) return '';
    return crypto.createHash('sha256').update(otp.toString().trim()).digest('hex');
  },

  /**
   * 3. Check if user is eligible to receive a new OTP (Cooldown check)
   */
  checkRateLimit: async ({ userId, type }) => {
    const existingOtp = await VerificationOTP.findOne({ userId, type });
    if (!existingOtp) return { allowed: true };

    const cooldownSeconds = getResendCooldownSeconds();
    const elapsedSeconds = Math.floor((Date.now() - new Date(existingOtp.lastSentAt).getTime()) / 1000);

    if (elapsedSeconds < cooldownSeconds) {
      const waitSeconds = cooldownSeconds - elapsedSeconds;
      return {
        allowed: false,
        waitSeconds,
        message: `Please wait ${waitSeconds} seconds before requesting a new verification code.`
      };
    }

    return { allowed: true };
  },

  /**
   * 4. Create and store a new hashed OTP
   * Invalidates any previous OTP of the same type for this user
   */
  createOTP: async ({ userId, type, ignoreCooldown = false }) => {
    if (!userId || !type) {
      throw new ApiError(400, 'User ID and OTP type are required to generate OTP');
    }

    // Check resend cooldown unless explicitly bypassed (e.g. initial registration)
    if (!ignoreCooldown) {
      const rateLimit = await otpService.checkRateLimit({ userId, type });
      if (!rateLimit.allowed) {
        throw new ApiError(429, rateLimit.message);
      }
    }

    // Invalidate/delete any previous OTP of this type for this user
    await VerificationOTP.deleteMany({ userId, type });

    // Generate secure 6-digit OTP
    const plainOtp = otpService.generateOTP();
    const otpHash = otpService.hashOTP(plainOtp);

    const expiryMinutes = getOtpExpiryMinutes();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Persist new hashed OTP in database
    await VerificationOTP.create({
      userId,
      type,
      otpHash,
      expiresAt,
      attempts: 0,
      lastSentAt: new Date()
    });

    // Return the unhashed OTP strictly for email/SMS transport dispatch
    return {
      plainOtp,
      expiresAt,
      expiryMinutes
    };
  },

  /**
   * 5. Verify user-entered OTP
   * Validates presence, expiration, attempt limit, and cryptographically compares hash
   */
  verifyOTP: async ({ userId, type, enteredOtp }) => {
    if (!userId || !type || !enteredOtp) {
      throw new ApiError(400, 'User ID, OTP type, and OTP code are required for verification');
    }

    const trimmedOtp = enteredOtp.toString().trim();
    if (!/^\d{6}$/.test(trimmedOtp)) {
      throw new ApiError(400, 'Verification code must be exactly 6 numeric digits');
    }

    // Find active OTP record
    const record = await VerificationOTP.findOne({ userId, type });
    if (!record) {
      throw new ApiError(400, 'No active verification code found or it has already expired. Please request a new code.');
    }

    // Check if expired
    if (new Date() > new Date(record.expiresAt)) {
      await VerificationOTP.deleteOne({ _id: record._id });
      throw new ApiError(400, 'Verification code has expired. Please request a new code.');
    }

    const maxAttempts = getMaxOtpAttempts();

    // Check if max attempt limit exceeded
    if (record.attempts >= maxAttempts) {
      await VerificationOTP.deleteOne({ _id: record._id });
      throw new ApiError(429, 'Too many incorrect verification attempts. This code is invalidated. Please request a new code.');
    }

    // Cryptographic hash comparison with timing safety
    const enteredHash = otpService.hashOTP(trimmedOtp);
    const storedHashBuffer = Buffer.from(record.otpHash, 'hex');
    const enteredHashBuffer = Buffer.from(enteredHash, 'hex');

    const isMatch =
      storedHashBuffer.length === enteredHashBuffer.length &&
      crypto.timingSafeEqual(storedHashBuffer, enteredHashBuffer);

    if (!isMatch) {
      // Increment failed attempts
      record.attempts += 1;
      await record.save();

      const remainingAttempts = Math.max(0, maxAttempts - record.attempts);

      if (remainingAttempts === 0) {
        await VerificationOTP.deleteOne({ _id: record._id });
        throw new ApiError(429, 'Too many incorrect attempts. This code has been invalidated. Please request a new code.');
      }

      throw new ApiError(400, `Invalid verification code. ${remainingAttempts} attempt(s) remaining.`);
    }

    // OTP verified successfully - Invalidate OTP record immediately to prevent reuse
    await VerificationOTP.deleteOne({ _id: record._id });

    return {
      success: true,
      message: 'OTP verified successfully'
    };
  },

  /**
   * 6. Invalidate/Remove active OTP
   */
  invalidateOTP: async ({ userId, type }) => {
    return await VerificationOTP.deleteMany({ userId, type });
  }
};
