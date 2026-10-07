import rateLimit from 'express-rate-limit';

/**
 * Standard JSON response handler for rate limit exceeded
 */
const rateLimitHandler = (message) => (req, res) => {
  return res.status(429).json({
    success: false,
    statusCode: 429,
    message,
    errors: ['Too many requests. Please wait and try again later.']
  });
};

/**
 * Global API rate limiter: 300 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: rateLimitHandler('API rate limit exceeded. Please try again after 15 minutes.')
});

/**
 * Strict Auth limiter (Login/Signup): 100 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: rateLimitHandler('Too many authentication attempts. Please try again after 15 minutes.')
});

/**
 * Booking / Payment Limiter: 200 requests per 15 minutes per IP
 */
export const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: rateLimitHandler('Too many booking/payment requests. Please try again after 15 minutes.')
});

/**
 * OTP Limiter: Max 15 OTP requests/verifications per 15 minutes per IP
 */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: rateLimitHandler('Too many verification requests from this IP. Please try again after 15 minutes.')
});

/**
 * Password Reset Limiter: Max 10 attempts per 15 minutes per IP
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: rateLimitHandler('Too many password reset requests. Please try again after 15 minutes.')
});


/**
 * Contact / Inquiry Limiter: Max 10 inquiries per 15 minutes per IP (Anti-Spam)
 */
export const inquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: rateLimitHandler('Too many contact requests from this IP. Please wait before submitting another message.')
});
