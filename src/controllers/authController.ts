import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User, { IUser } from '../models/User';
import { generateToken, generateRefreshToken, verifyToken } from '../utils/jwt.utils';
import { AppError } from '../utils/AppError';

/**
 * Register a new user
 * @route POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array()
            });
            return;
        }

        const { email, password, username, firstName, lastName, phoneNumber } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            const field = existingUser.email === email ? 'email' : 'username';
            res.status(409).json({
                success: false,
                message: `User with this ${field} already exists`
            });
            return;
        }

        // Create new user
        const user = await User.create({
            email,
            password,
            username,
            firstName,
            lastName,
            phoneNumber
        });

        // Generate tokens
        const accessToken = generateToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role
        });

        const refreshToken = generateRefreshToken({
            id: user._id.toString()
        });

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    fullName: user.getFullName()
                },
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
                }
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register user',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, username, password } = req.body;

        // Check validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array()
            });
            return;
        }

        // Find user by email or username (with password field)
        const user = await User.findOne({
            $or: [
                { email: email?.toLowerCase() },
                { username }
            ]
        }).select('+password');

        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.'
            });
            return;
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Generate tokens
        const accessToken = generateToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role
        });

        const refreshToken = generateRefreshToken({
            id: user._id.toString()
        });

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    fullName: user.getFullName(),
                    lastLogin: user.lastLogin
                },
                tokens: {
                    accessToken,
                    refreshToken,
                    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
                }
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to login',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};

/**
 * Refresh access token
 * @route POST /api/auth/refresh
 */
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
            return;
        }

        // Verify refresh token
        const decoded = verifyToken(refreshToken, true) as { id: string };

        // Get user
        const user = await User.findById(decoded.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Generate new access token
        const newAccessToken = generateToken({
            id: user._id.toString(),
            email: user.email,
            role: user.role
        });

        res.status(200).json({
            success: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token'
        });
    }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
    // In a production app, you might want to:
    // 1. Blacklist the token
    // 2. Clear refresh token from database
    // 3. Clear any server-side sessions

    res.status(200).json({
        success: true,
        message: 'Logged out successfully'
    });
};

/**
 * Get current user
 * @route GET /api/auth/me
 */
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    fullName: user.getFullName(),
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    phoneNumber: user.phoneNumber,
                    isEmailVerified: user.isEmailVerified,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        console.error('Get current user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get user information'
        });
    }
};
