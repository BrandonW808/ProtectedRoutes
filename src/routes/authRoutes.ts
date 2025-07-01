import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middleware/authMiddleware';
import {
    validateLogin,
    validateRegister,
    validateRefreshToken
} from '../validators/authValidators';

const router = Router();

/**
 * Public routes
 */

// Register a new user
router.post('/register', validateRegister, authController.register);

// Login user
router.post('/login', validateLogin, authController.login);

// Refresh access token
router.post('/refresh', validateRefreshToken, authController.refreshToken);

/**
 * Protected routes
 */

// Get current user
router.get('/me', authenticate, authController.getCurrentUser);

// Logout user
router.post('/logout', authenticate, authController.logout);

export default router;
