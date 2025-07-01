import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include user (for protected routes)
interface AuthRequest extends Request {
    user?: { id: string; role: string }; // Payload from JWT
}

// Function to generate JWT
export const generateToken = (user: { id: string; role: string }): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined in environment variables');

    return jwt.sign(
        { id: user.id, role: user.role }, // Payload: Include user ID and role for authorization
        secret,
        { expiresIn: '1h' } // Token expires in 1 hour (adjust as needed)
    );
};

// Middleware to protect routes by verifying JWT
export const protectRoute = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(' ')[1]; // Expect Bearer token

    if (!token) {
        res.status(401).json({ message: 'No token provided, authorization denied' });
        return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        res.status(500).json({ message: 'Server configuration error' });
        return;
    }

    try {
        const decoded = jwt.verify(token, secret) as { id: string; role: string };
        req.user = decoded; // Attach decoded user to request for use in routes
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};