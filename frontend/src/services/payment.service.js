import api from './api';

export const paymentService = {
  /**
   * Create Razorpay payment order on backend
   * @param {Object} data - { appointmentId }
   */
  createOrder: async (data) => {
    return await api.post('/payments/create-order', data);
  },

  /**
   * Verify Razorpay cryptographic payment signature on backend
   * @param {Object} data - { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentMethod }
   */
  verifyPayment: async (data) => {
    return await api.post('/payments/verify', data);
  },

  /**
   * Log payment failure or cancellation on backend
   * @param {Object} data - { appointmentId, razorpay_order_id, error_code, error_description, error_reason }
   */
  reportFailure: async (data) => {
    return await api.post('/payments/failure', data);
  },

  /**
   * Get payment receipt and details for an appointment
   * @param {string} appointmentId
   */
  getPaymentByAppointment: async (appointmentId) => {
    return await api.get(`/payments/appointment/${appointmentId}`);
  },

  /**
   * Admin: Process refund for a payment
   * @param {string} paymentId
   * @param {Object} data - { amount, reason }
   */
  refundPayment: async (paymentId, data) => {
    return await api.post(`/payments/${paymentId}/refund`, data);
  }
};
