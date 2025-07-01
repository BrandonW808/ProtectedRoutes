import { body, ValidationChain } from 'express-validator';

/**
 * Validation rules for updating user profile
 */
export const validateUpdateProfile: ValidationChain[] = [
    body('username')
        .optional()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('firstName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('First name cannot exceed 50 characters'),
    
    body('lastName')
        .optional()
        .isLength({ max: 50 })
        .withMessage('Last name cannot exceed 50 characters'),
    
    body('bio')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Bio cannot exceed 500 characters'),
    
    body('phoneNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    
    body('dateOfBirth')
        .optional()
        .isISO8601()
        .withMessage('Please provide a valid date')
        .custom((value) => {
            const date = new Date(value);
            if (date >= new Date()) {
                throw new Error('Date of birth must be in the past');
            }
            return true;
        }),
    
    body('address.zipCode')
        .optional()
        .isPostalCode('any')
        .withMessage('Please provide a valid postal code')
];

/**
 * Validation rules for changing password
 */
export const validateChangePassword: ValidationChain[] = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
        .custom((value, { req }) => value !== req.body.currentPassword)
        .withMessage('New password must be different from current password')
];

/**
 * Validation rules for updating user role
 */
export const validateUpdateRole: ValidationChain[] = [
    body('role')
        .notEmpty()
        .withMessage('Role is required')
        .isIn(['admin', 'user', 'moderator'])
        .withMessage('Invalid role. Must be admin, user, or moderator')
];
