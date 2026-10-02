import { Router } from 'express';
import {
  getStaffList,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  seedDefaultStaff
} from '../controllers/staff.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';
import {
  validateCreateStaff,
  validateUpdateStaff
} from '../middlewares/staffValidator.middleware.js';

const router = Router();

// Public Routes
router.get('/', getStaffList);
router.get('/:id', validateObjectId('id'), getStaffById);
router.post('/seed', seedDefaultStaff);

// Admin Protected Routes
router.post(
  '/',
  verifyJWT,
  authorizeRoles('admin'),
  validateCreateStaff,
  createStaff
);

router.put(
  '/:id',
  verifyJWT,
  authorizeRoles('admin'),
  validateObjectId('id'),
  validateUpdateStaff,
  updateStaff
);

router.delete(
  '/:id',
  verifyJWT,
  authorizeRoles('admin'),
  validateObjectId('id'),
  deleteStaff
);

export default router;
