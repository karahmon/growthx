import mongoose from 'mongoose';

const connectDB = async () => {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
        console.log("Already connected to MongoDB");
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        throw error; // Re-throw the error to handle it in index.js
    }
};

export default connectDB;
