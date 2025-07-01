import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import protectedRoutes from './routes/protectedRoutes'; // Import protected routes
import { login } from './controllers/authController'; // Import login handler

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json()); // Parse JSON bodies

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yourdbname')
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.post('/login', login); // Public login route
app.use('/api', protectedRoutes); // Protected routes under /api (e.g., /api/protected)

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));