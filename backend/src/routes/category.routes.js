import { Router } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/category.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();

router.get('/', getCategories);

router.post('/', verifyJWT, authorizeRoles('admin'), createCategory);
router.put('/:id', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), updateCategory);
router.delete('/:id', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), deleteCategory);

export default router;
