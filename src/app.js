import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from 'mongoose';

// Initialize Express app
const app = express();

// Middleware configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

// Import routes
import userRouter from './routes/user.routes.js';
import adminRouter from './routes/admin.routes.js';
import oauthRouter from './routes/oauth.routes.js'; 

// Mount routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admins", adminRouter);
app.use("/api/v1/auth", oauthRouter); // Mount OAuth routes

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

export { app };
