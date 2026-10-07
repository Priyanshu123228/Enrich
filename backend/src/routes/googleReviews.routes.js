import { Router } from 'express';
import { getGoogleReviews } from '../controllers/googleReviews.controller.js';

const router = Router();

// GET /api/v1/google-reviews
router.get('/', getGoogleReviews);

export default router;
