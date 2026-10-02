import { Router } from 'express';
import {
  getGalleryMedia,
  getFeaturedMedia,
  getMediaCategoriesList,
  getMediaById,
  adminGetAllMedia,
  createMedia,
  updateMedia,
  toggleMediaStatus,
  deleteMedia,
  uploadSingleFile,
  seedDefaultMedia
} from '../controllers/media.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { uploadMedia } from '../middlewares/upload.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();

// Public Gallery Routes
router.get('/', getGalleryMedia);
router.get('/featured', getFeaturedMedia);
router.get('/categories', getMediaCategoriesList);
router.get('/:id', validateObjectId('id'), getMediaById);

// Admin Routes
router.post('/seed', verifyJWT, authorizeRoles('admin'), seedDefaultMedia);
router.get('/admin/all', verifyJWT, authorizeRoles('admin'), adminGetAllMedia);
router.post('/upload', verifyJWT, authorizeRoles('admin'), uploadMedia.single('file'), uploadSingleFile);
router.post('/', verifyJWT, authorizeRoles('admin'), uploadMedia.single('mediaFile'), createMedia);
router.put('/:id', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), uploadMedia.single('mediaFile'), updateMedia);
router.put('/:id/status', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), toggleMediaStatus);
router.delete('/:id', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), deleteMedia);

export default router;
