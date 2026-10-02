import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analytics.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

router.get(
  '/dashboard',
  verifyJWT,
  authorizeRoles('admin'),
  getDashboardAnalytics
);

export default router;
