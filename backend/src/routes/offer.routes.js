import { Router } from 'express';
import {
  getActiveOffers,
  getAllOffers,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
  validateOfferCode
} from '../controllers/offer.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();

router.get('/', getActiveOffers);
router.post('/validate', validateOfferCode);

// Admin Routes
router.get('/admin', verifyJWT, authorizeRoles('admin'), getAllOffers);
router.post('/', verifyJWT, authorizeRoles('admin'), createOffer);
router.put('/:id', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), updateOffer);
router.patch('/:id/toggle-status', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), toggleOfferStatus);
router.delete('/:id', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), deleteOffer);

export default router;
