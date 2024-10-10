import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false, // Ensure it's selectable when explicitly requested
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    oauthProvider: {
        type: String,
        enum: [null, 'google', 'facebook'], // Add other providers as needed
        default: null,
    },
    oauthId: {
        type: String,
        default: null,
    },
    assignments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
    }],
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });


const User = mongoose.model('User', userSchema);

export default User;
