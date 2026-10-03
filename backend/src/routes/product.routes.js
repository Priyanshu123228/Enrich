import { Router } from 'express';
import {
  getProducts,
  getProductByIdOrSlug,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
  uploadProductImage
} from '../controllers/product.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { uploadMedia } from '../middlewares/upload.middleware.js';

const router = Router();

// Public Routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:idOrSlug', getProductByIdOrSlug);

// Admin-Protected Routes
router.post('/upload', verifyJWT, authorizeRoles('admin'), uploadMedia.single('image'), uploadProductImage);
router.post('/', verifyJWT, authorizeRoles('admin'), createProduct);
router.patch('/:id', verifyJWT, authorizeRoles('admin'), updateProduct);
router.delete('/:id', verifyJWT, authorizeRoles('admin'), deleteProduct);
router.post('/seed', verifyJWT, authorizeRoles('admin'), seedProducts);

export default router;
