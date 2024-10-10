import express from 'express';
import passport from 'passport';

const router = express.Router();

// Initiate Google OAuth login
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Handle Google OAuth callback
router.get('/auth/google/callback',
    passport.authenticate('google', { failureMessage: 'Login failed' }),
    (req, res) => {
        if (req.isAuthenticated()) {
            // Successful login
            res.status(200).json({ message: 'Login successful' });
        } else {
            // Failed login
            res.status(401).json({ message: 'Login failed' });
        }
    }
);

export default router;
