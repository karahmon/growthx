import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from './app.js';

// Load environment variables from .env file
dotenv.config({
    path: './.env'
});

// Connect to MongoDB
connectDB()
    .then(() => {
        // Start the server after a successful database connection
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port: ${process.env.PORT || 8000}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection failed!!!", err);
    });
