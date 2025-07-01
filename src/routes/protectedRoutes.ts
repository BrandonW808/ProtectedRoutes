import express, { Router } from 'express';
import { protectRoute } from '../utils/auth'; // Import protection middleware

const router: Router = express.Router();

// Example protected route: Only accessible with a valid JWT
router.get('/protected', protectRoute, (req, res) => {
    // `req.user` is available due to the middleware
    const user = (req as any).user; // Type assertion (from AuthRequest)

    res.status(200).json({
        message: 'This is a protected route!',
        user: { id: user.id, role: user.role } // Example: Return user info
    });
});

// Export the router to use in your main app file
export default router;