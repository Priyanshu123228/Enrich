
import { Router } from 'express';
import {
  getActiveSocialLinks,
  getAllSocialLinks,
  createSocialLink,
  updateSocialLink,
  toggleSocialLinkStatus,
  reorderSocialLinks,
  deleteSocialLink
} from '../controllers/social.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();

// Public: Get all active, admin-configured social media links
router.get('/', getActiveSocialLinks);

// Admin Routes (Protected)
router.get('/admin', verifyJWT, authorizeRoles('admin'), getAllSocialLinks);
router.post('/', verifyJWT, authorizeRoles('admin'), createSocialLink);
router.patch('/reorder', verifyJWT, authorizeRoles('admin'), reorderSocialLinks);
router.put('/:id', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), updateSocialLink);
router.patch('/:id/toggle', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), toggleSocialLinkStatus);
router.delete('/:id', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), deleteSocialLink);

export default router;
