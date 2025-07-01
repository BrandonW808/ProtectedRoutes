import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User, { IUser } from '../models/User';

/**
 * Get all users (Admin only)
 * @route GET /api/users
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const { page = 1, limit = 10, role, isActive, search } = req.query;

        // Build query
        const query: any = {};

        if (role) {
            query.role = role;
        }

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (search) {
            query.$or = [
                { email: { $regex: search, $options: 'i' } },
                { username: { $regex: search, $options: 'i' } },
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ];
        }

        // Pagination
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        // Get users with pagination
        const [users, total] = await Promise.all([
            User.find(query)
                .select('-password')
                .skip(skip)
                .limit(limitNum)
                .sort({ createdAt: -1 }),
            User.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    fullName: user.getFullName(),
                    role: user.role,
                    isActive: user.isActive,
                    isEmailVerified: user.isEmailVerified,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                })),
                pagination: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    pages: Math.ceil(total / limitNum)
                }
            }
        });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users'
        });
    }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');

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
                    fullName: user.getFullName(),
                    role: user.role,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    phoneNumber: user.phoneNumber,
                    dateOfBirth: user.dateOfBirth,
                    address: user.address,
                    isActive: user.isActive,
                    isEmailVerified: user.isEmailVerified,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user'
        });
    }
};

/**
 * Update user profile
 * @route PUT /api/users/profile
 */
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
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

        const userId = req.user?.id;
        const updates = req.body;

        // Remove fields that shouldn't be updated through this endpoint
        delete updates.password;
        delete updates.role;
        delete updates.isActive;
        delete updates.isEmailVerified;
        delete updates.email; // Email update should be done separately with verification

        const user = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    fullName: user.getFullName(),
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    phoneNumber: user.phoneNumber,
                    dateOfBirth: user.dateOfBirth,
                    address: user.address
                }
            }
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile'
        });
    }
};

/**
 * Change user password
 * @route PUT /api/users/password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;

        // Get user with password field
        const user = await User.findById(userId).select('+password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Verify current password
        const isPasswordValid = await user.comparePassword(currentPassword);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
            return;
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password'
        });
    }
};

/**
 * Delete user account
 * @route DELETE /api/users/account
 */
export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        const { password } = req.body;

        // Get user with password field
        const user = await User.findById(userId).select('+password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            res.status(401).json({
                success: false,
                message: 'Password is incorrect'
            });
            return;
        }

        // Soft delete (deactivate) or hard delete based on your preference
        // Soft delete:
        user.isActive = false;
        await user.save();

        // Hard delete:
        // await User.findByIdAndDelete(userId);

        res.status(200).json({
            success: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete account'
        });
    }
};

/**
 * Update user role (Admin only)
 * @route PUT /api/users/:id/role
 */
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    fullName: user.getFullName(),
                    role: user.role
                }
            }
        });
    } catch (error) {
        console.error('Update user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user role'
        });
    }
};

/**
 * Toggle user status (Admin only)
 * @route PUT /api/users/:id/status
 */
export const toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        user.isActive = !user.isActive;
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    username: user.username,
                    isActive: user.isActive
                }
            }
        });
    } catch (error) {
        console.error('Toggle user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
};
