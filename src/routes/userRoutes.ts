import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authenticate, authorize } from '../middleware/authMiddleware';
import {
    validateUpdateProfile,
    validateChangePassword,
    validateUpdateRole
} from '../validators/userValidators';

const router = Router();

/**
 * All routes require authentication
 */
router.use(authenticate);

/**
 * User routes
 */

// Get current user's profile
router.get('/profile', userController.updateProfile);

// Update current user's profile
router.put('/profile', validateUpdateProfile, userController.updateProfile);

// Change password
router.put('/password', validateChangePassword, userController.changePassword);

// Delete own account
router.delete('/account', userController.deleteAccount);

/**
 * Admin routes
 */

// Get all users (Admin only)
router.get('/', authorize(['admin']), userController.getAllUsers);

// Get user by ID (Admin only)
router.get('/:id', authorize(['admin', 'moderator']), userController.getUserById);

// Update user role (Admin only)
router.put('/:id/role', authorize(['admin']), validateUpdateRole, userController.updateUserRole);

// Toggle user status (Admin only)
router.put('/:id/status', authorize(['admin']), userController.toggleUserStatus);

export default router;
