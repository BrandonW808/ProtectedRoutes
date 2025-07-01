import { body, ValidationChain } from 'express-validator';

/**
 * Validation rules for user registration
 */
export const validateRegister: ValidationChain[] = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('username')
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    
    body('lastName')
        .notEmpty()
        .withMessage('Last name is required')
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    
    body('phoneNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number')
];

/**
 * Validation rules for user login
 */
export const validateLogin: ValidationChain[] = [
    body()
        .custom((value) => {
            if (!value.email && !value.username) {
                throw new Error('Either email or username is required');
            }
            return true;
        }),
    
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email'),
    
    body('username')
        .optional()
        .notEmpty()
        .withMessage('Username cannot be empty'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

/**
 * Validation rules for refresh token
 */
export const validateRefreshToken: ValidationChain[] = [
    body('refreshToken')
        .notEmpty()
        .withMessage('Refresh token is required')
        .isJWT()
        .withMessage('Invalid refresh token format')
];
