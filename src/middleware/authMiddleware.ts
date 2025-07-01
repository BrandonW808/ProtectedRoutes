import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.utils';

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;

        if (!token) {
            res.status(401).json({
                success: false,
                message: 'Access token is required'
            });
            return;
        }

        // Verify token
        const decoded = verifyToken(token) as {
            id: string;
            email: string;
            role: string;
        };

        // Attach user info to request
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
};

/**
 * Middleware to authorize based on user roles
 */
export const authorize = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Authentication required'
            });
            return;
        }

        if (!roles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to access this resource'
            });
            return;
        }

        next();
    };
};

/**
 * Middleware to optionally authenticate (doesn't fail if no token)
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.substring(7) 
            : null;

        if (token) {
            const decoded = verifyToken(token) as {
                id: string;
                email: string;
                role: string;
            };
            req.user = decoded;
        }
        
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
};
