import bcrypt from 'bcryptjs'; // Correct bcryptjs import
import User from '../models/user.model.js';
import Assignment from '../models/assignment.model.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Admin from '../models/admin.model.js';

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
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '50d' });
};

// Helper function for consistent error responses
const errorResponse = (res, status, message, error = null) => {
  console.error(`${message}:`, error);
  res.status(status).json({ success: false, message, error: error?.message });
};

// Register a new user
export const register = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return errorResponse(res, 400, 'Please provide username, email, and password');
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return errorResponse(res, 400, 'User with this email or username already exists');
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    errorResponse(res, 500, 'Error registering user', error);
  }
};

// Login user
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return errorResponse(res, 400, 'Email and password are required');
  }

  try {
    // Find the user and ensure we select the password field
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('User not found');
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await comparePasswords(password, user.password);


    if (!isMatch) {
      console.log('Password mismatch');
      return errorResponse(res, 401, 'Invalid credentials');
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    errorResponse(res, 500, 'Server error during login', error);
  }
};

// Upload an assignment
export const uploadAssignment = async (req, res) => {
  const { userId, task, adminId } = req.body;

  if (!userId || !task || !adminId) {
    return errorResponse(res, 400, 'User ID, task, and admin ID are required');
  }

  try {
    const user = await User.findOne({ username: userId });
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    const admin = await Admin.findOne({ username: adminId });
    if (!admin) {
      return errorResponse(res, 404, 'Admin not found');
    }

    // Create a new assignment
    const newAssignment = await Assignment.create({
      userId: user._id,
      task,
      adminId: admin._id,
      username: user.username, // Include the username here
    });

    res.status(201).json({
      success: true,
      message: 'Assignment uploaded successfully',
      assignment: newAssignment,
    });
  } catch (error) {
    console.error('Error uploading assignment:', error);
    errorResponse(res, 500, 'Error uploading assignment', error);
  }
};
// Fetch all admins
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({ role: 'admin' }).select('username');

    res.json({
      success: true,
      admins,
    });
  } catch (error) {
    errorResponse(res, 500, 'Error fetching admins', error);
  }
};
