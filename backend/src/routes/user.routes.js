import { Router } from 'express';
import {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getUserFavorites,
  toggleFavoriteService
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/role.middleware.js';
import { validateObjectId } from '../middlewares/validateObjectId.middleware.js';

const router = Router();

// Customer Private Routes
router.get('/favorites', verifyJWT, getUserFavorites);
router.post('/favorites/:serviceId', verifyJWT, validateObjectId('serviceId'), toggleFavoriteService);

// Admin Private Routes
router.get('/', verifyJWT, authorizeRoles('admin'), getAllUsers);
router.put('/:id/status', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), toggleUserStatus);
router.delete('/:id', verifyJWT, authorizeRoles('admin'), validateObjectId('id'), deleteUser);

export default router;
