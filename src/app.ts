import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

// Import middleware
import { errorHandler } from './middleware/errorMiddleware';
import { notFoundHandler } from './middleware/notFoundMiddleware';

// Load environment variables
dotenv.config();

// Create Express app
const app: Application = express();

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Database connection
const connectDB = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/user_management_db';
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
    console.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});

// Start the server
startServer();

export default app;
