import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentFailure,
  getPaymentByAppointment,
  refundPayment
} from '../controllers/payment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';
import { bookingLimiter } from '../middlewares/rateLimiter.middleware.js';

const router = Router();

// Customer Payment Routes (Protected with Rate Limiting)
router.post('/create-order', verifyJWT, bookingLimiter, createPaymentOrder);
router.post('/verify', verifyJWT, bookingLimiter, verifyPayment);
router.post('/failure', verifyJWT, handlePaymentFailure);
router.get(
  '/appointment/:appointmentId',
  verifyJWT,
  validateObjectId('appointmentId'),
  getPaymentByAppointment
);

// Admin Refund Route
router.post(
  '/:id/refund',
  verifyJWT,
  authorizeRoles('admin'),
  validateObjectId('id'),
  refundPayment
);

export default router;
