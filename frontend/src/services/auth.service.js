import api from './api';

export const authService = {
  /**
   * Register a new user (Creates pending account & triggers email OTP)
   * @param {Object} userData - { name, email, phone, password, confirmPassword }
   */
  signup: async (userData) => {
    return await api.post('/auth/signup', userData);
  },

  /**
   * Verify email address with 6-digit OTP
   * @param {Object} data - { userId, email, otp }
   */
  verifyEmail: async (data) => {
    return await api.post('/auth/verify-email', data);
  },

  /**
   * Resend Email OTP
   * @param {Object} data - { userId, email }
   */
  resendEmailOTP: async (data) => {
    return await api.post('/auth/resend-email-otp', data);
  },

  /**
   * Login user with credentials
   * @param {Object} credentials - { email, password }
   */
  login: async (credentials) => {
    return await api.post('/auth/login', credentials);
  },

  /**
   * Request password reset code (Account enumeration safe)
   * @param {Object} data - { email }
   */
  forgotPassword: async (data) => {
    return await api.post('/auth/forgot-password', data);
  },

  /**
   * Verify password reset OTP
   * @param {Object} data - { email, otp }
   */
  verifyResetOTP: async (data) => {
    return await api.post('/auth/verify-reset-otp', data);
  },

  /**
   * Reset password with new password
   * @param {Object} data - { email, otp, newPassword, confirmPassword }
   */
  resetPassword: async (data) => {
    return await api.post('/auth/reset-password', data);
  },

  /**
   * Send / request phone verification OTP via SMS
   * @param {Object} data - { phone }
   */
  sendPhoneOTP: async (data = {}) => {
    return await api.post('/auth/send-phone-otp', data);
  },

  /**
   * Verify phone number with 6-digit OTP
   * @param {Object} data - { otp }
   */
  verifyPhoneOTP: async (data) => {
    return await api.post('/auth/verify-phone', data);
  },

  /**
   * Resend phone verification OTP
   * @param {Object} data - { phone }
   */
  resendPhoneOTP: async (data = {}) => {
    return await api.post('/auth/resend-phone-otp', data);
  },

  /**
   * Fetch current authenticated user profile
   */
  getMe: async () => {
    return await api.get('/auth/me');
  },

  /**
   * Update profile details (Name, phone, avatar)
   * @param {Object} profileData - { name, phone, avatar }
   */
  updateProfile: async (profileData) => {
    return await api.put('/auth/profile', profileData);
  },

  /**
   * Update password
   * @param {Object} passwordData - { currentPassword, newPassword }
   */
  changePassword: async (passwordData) => {
    return await api.put('/auth/change-password', passwordData);
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      return await api.post('/auth/logout');
    } catch {
      // Graceful fallback if backend is unreachable
      return { success: true };
    }
  }
};
