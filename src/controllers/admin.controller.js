import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';
import Assignment from '../models/assignment.model.js'; // Assuming this model exists
import mongoose from 'mongoose';


dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('JWT_SECRET is not set in environment variables');
    process.exit(1);
}

// Helper function to hash password using bcryptjs
const hashPassword = async (password) => {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
};

// Helper function to compare passwords
const comparePasswords = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

// Helper function to generate JWT token
const generateToken = (adminId) => {
    return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: '50d' });
};

// Helper function for consistent error responses
const errorResponse = (res, status, message, error = null) => {
    console.error(`${message}:`, error);
    res.status(status).json({ success: false, message, error: error?.message });
};

// Register a new admin
export const registerAdmin = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return errorResponse(res, 400, 'Please provide username, email, and password');
    }

    try {
        const existingAdmin = await Admin.findOne({ $or: [{ email }, { username }] });
        if (existingAdmin) {
            return errorResponse(res, 400, 'Admin with this email or username already exists');
        }

        const hashedPassword = await hashPassword(password);
        const newAdmin = await Admin.create({
            username,
            email,
            password: hashedPassword,
        });

        const token = generateToken(newAdmin._id);

        res.status(201).json({
            success: true,
            message: 'Admin registered successfully',
            token,
            admin: {
                id: newAdmin._id,
                username: newAdmin.username,
                email: newAdmin.email,
            },
        });
    } catch (error) {
        errorResponse(res, 500, 'Error registering admin', error);
    }
};

// Login admin
export const loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return errorResponse(res, 400, 'Email and password are required');
    }

    try {
        const admin = await Admin.findOne({ email }).select('+password');
        if (!admin) {
            console.log('Admin not found');
            return errorResponse(res, 401, 'Invalid credentials');
        }

        const isMatch = await comparePasswords(password, admin.password);
        if (!isMatch) {
            console.log('Password mismatch');
            return errorResponse(res, 401, 'Invalid credentials');
        }

        const token = generateToken(admin._id);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                email: admin.email,
            },
        });
    } catch (error) {
        errorResponse(res, 500, 'Server error during login', error);
    }
};

// Get assignments for admin
export const getAdminAssignments = async (req, res) => {
    try {
        const adminId = req.admin._id; // Ensure this is set in your JWT verification middleware
        if (!adminId) {
            return errorResponse(res, 400, 'Admin ID is missing');
        }

        // Convert adminId to ObjectId using 'new'
        const objectId = new mongoose.Types.ObjectId(adminId);
        const assignments = await Assignment.find({ adminId: objectId });

        if (!assignments || assignments.length === 0) {
            return errorResponse(res, 404, 'No assignments found for this admin');
        }

        return res.status(200).json(assignments);
    } catch (error) {
        return errorResponse(res, 500, 'Server error retrieving assignments', error);
    }
};



// Accept an assignment
export const acceptAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findByIdAndUpdate(id, { status: 'accepted' }, { new: true });

        if (!assignment) {
            return errorResponse(res, 404, 'Assignment not found');
        }

        return res.status(200).json({ message: 'Assignment accepted', assignment });
    } catch (error) {
        return errorResponse(res, 500, 'Server error accepting assignment', error);
    }
};

// Reject an assignment
export const rejectAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const assignment = await Assignment.findByIdAndUpdate(id, { status: 'rejected' }, { new: true });

        if (!assignment) {
            return errorResponse(res, 404, 'Assignment not found');
        }

        return res.status(200).json({ message: 'Assignment rejected', assignment });
    } catch (error) {
        return errorResponse(res, 500, 'Server error rejecting assignment', error);
    }
};
