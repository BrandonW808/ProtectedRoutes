import { Request, Response } from 'express';
import User, { IUser } from '../models/User'; // Import the User model
import { generateToken } from '../utils/auth'; // Import token generator

// Login function (to be used as an Express route handler)
export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }

    try {
        // Find user by email
        const user: IUser | null = await User.findOne({ email });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Compare provided password with hashed password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }

        // Generate JWT token
        const token = generateToken({ id: user._id.toString(), role: user.role });

        // Respond with token and user details (avoid sending password)
        res.status(200).json({
            message: 'Login successful',
            token,
            user: { id: user._id, email: user.email, name: user.name, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error });
    }
};