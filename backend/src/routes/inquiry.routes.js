import { Router } from 'express';
import {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry
} from '../controllers/inquiry.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';

const router = Router();

// Public Route: Submit an inquiry / contact request
router.post('/', createInquiry);

// Admin-only Routes
router.use(verifyJWT, authorizeRoles('admin'));
router.get('/', getInquiries);
router.get('/:id', getInquiryById);
router.patch('/:id/status', updateInquiryStatus);
router.delete('/:id', deleteInquiry);

export default router;
