import { getGoogleReviews } from '../controllers/googleReviews.controller.js';
import { Router } from 'express';
import {
  getPublicReviews,
  getMyReviews,
  getPendingReviewAppointments,
  getAdminReviews,
  createReview,
  toggleReviewApproval,
  deleteReview
} from '../controllers/review.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();

router.get('/google', getGoogleReviews);
router.get('/', getPublicReviews);
router.get('/my', verifyJWT, getMyReviews);
router.get('/pending', verifyJWT, getPendingReviewAppointments);
router.post('/', verifyJWT, createReview);

// Admin Routes
router.get('/admin', verifyJWT, authorizeRoles('admin'), getAdminReviews);
router.put('/:id/approval', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), toggleReviewApproval);
router.delete('/:id', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), deleteReview);

export default router;
