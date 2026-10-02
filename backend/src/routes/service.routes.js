import { Router } from 'express';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  getServiceCategories,
  seedDefaultServices
} from '../controllers/service.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';
import {
  validateCreateService,
  validateUpdateService
} from '../middlewares/serviceValidator.middleware.js';

const router = Router();

// Public Routes
router.get('/', getServices);
router.get('/categories', getServiceCategories);
router.post('/seed', seedDefaultServices);
router.get('/:id', validateObjectId('id'), getServiceById);

// Admin-Only Protected Routes
router.post(
  '/',
  verifyJWT,
  authorizeRoles('admin'),
  validateCreateService,
  createService
);

router.put(
  '/:id',
  verifyJWT,
  authorizeRoles('admin'),
  validateObjectId('id'),
  validateUpdateService,
  updateService
);

router.delete(
  '/:id',
  verifyJWT,
  authorizeRoles('admin'),
  validateObjectId('id'),
  deleteService
);

export default router;
