import { Router } from 'express';
import {
    register,
    login,
    uploadAssignment,
    getAllAdmins
} from '../controllers/user.controller.js'; // Ensure the import is correct
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// User Endpoints
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/upload').post(verifyJWT, uploadAssignment); // Protect upload with JWT
router.route('/admins').get(verifyJWT, getAllAdmins); // Protect getAllAdmins with JWT

export default router;
