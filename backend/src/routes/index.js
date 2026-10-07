import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import serviceRoutes from './service.routes.js';
import staffRoutes from './staff.routes.js';
import slotRoutes from './slot.routes.js';
import appointmentRoutes from './appointment.routes.js';
import analyticsRoutes from './analytics.routes.js';
import userRoutes from './user.routes.js';
import categoryRoutes from './category.routes.js';
import offerRoutes from './offer.routes.js';
import reviewRoutes from './review.routes.js';
import paymentRoutes from './payment.routes.js';
import mediaRoutes from './media.routes.js';
import socialRoutes from './social.routes.js';
import inquiryRoutes from './inquiry.routes.js';
import productRoutes from './product.routes.js';
import googleReviewsRoutes from './googleReviews.routes.js';

const router = Router();

// Mount API sub-routes
router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/staff', staffRoutes);
router.use('/slots', slotRoutes);
router.use('/appointments', appointmentRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/offers', offerRoutes);
router.use('/reviews', reviewRoutes);
router.use('/payments', paymentRoutes);
router.use('/media', mediaRoutes);
router.use('/social-links', socialRoutes);
router.use('/social-media', socialRoutes); // Convenient alias
router.use('/inquiries', inquiryRoutes);
router.use('/contact', inquiryRoutes); // Convenient alias
router.use('/products', productRoutes);
router.use('/cosmetics', productRoutes); // Convenient alias
router.use('/google-reviews', googleReviewsRoutes);

export default router;
