import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    console.error('Error:', err);

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new AppError(message, 404);
    }

    // Mongoose duplicate key
    if ((err as any).code === 11000) {
        const field = Object.keys((err as any).keyValue)[0];
        const message = `${field} already exists`;
        error = new AppError(message, 400);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values((err as any).errors).map((e: any) => e.message);
        const message = errors.join(', ');
        error = new AppError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new AppError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new AppError(message, 401);
    }

    const statusCode = (error as AppError).statusCode || 500;
    const message = error.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { 
            error: err,
            stack: err.stack 
        })
    });
};
