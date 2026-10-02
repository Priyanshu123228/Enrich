import { Router } from 'express';
import {
  createAppointment,
  getAppointmentById,
  getMyAppointments,
  cancelAppointment,
  rescheduleAppointment,
  sendAppointmentReminder,
  getAllAppointments,
  updateAppointmentStatus,
  getStaffSchedule
} from '../controllers/appointment.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';
import { bookingLimiter } from '../middlewares/rateLimiter.middleware.js';
import {
  validateCreateAppointment,
  validateRescheduleAppointment,
  validateStatusUpdate
} from '../middlewares/appointmentValidator.middleware.js';

const router = Router();

// Customer Protected Routes
router.post(
  '/',
  verifyJWT,
  bookingLimiter,
  validateCreateAppointment,
  createAppointment
);

router.get('/my', verifyJWT, getMyAppointments);
router.get('/:id', verifyJWT, validateObjectId('id'), getAppointmentById);
router.put('/:id/cancel', verifyJWT, validateObjectId('id'), cancelAppointment);
router.put(
  '/:id/reschedule',
  verifyJWT,
  validateObjectId('id'),
  validateRescheduleAppointment,
  rescheduleAppointment
);
router.post('/:id/reminder', verifyJWT, validateObjectId('id'), sendAppointmentReminder);

// Staff / Admin Schedule View
router.get(
  '/staff/schedule',
  verifyJWT,
  authorizeRoles('staff', 'admin'),
  getStaffSchedule
);

// Admin Master Management Routes
router.get(
  '/admin/all',
  verifyJWT,
  authorizeRoles('admin'),
  getAllAppointments
);

router.put(
  '/:id/status',
  verifyJWT,
  authorizeRoles('admin'),
  validateObjectId('id'),
  validateStatusUpdate,
  updateAppointmentStatus
);

export default router;
