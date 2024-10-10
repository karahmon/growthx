// middlewares/auth.middleware.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Middleware to verify JWT
export const verifyJWT = (req, res, next) => {
    // Extract the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Get the token part

    // If no token, return unauthorized status
    if (!token) return res.sendStatus(401); // Unauthorized

    // Verify the token using the secret
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        // If verification fails, return forbidden status
        if (err) return res.sendStatus(403); // Forbidden

        // Attach admin info to the request object
        req.admin = { _id: decoded.adminId }; // Ensure the correct property is set based on your token's payload

        next(); // Proceed to the next middleware or route handler
    });
};
