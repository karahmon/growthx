import { Router } from 'express';
import {
    registerAdmin, 
    loginAdmin, 
    getAdminAssignments, 
    acceptAssignment, 
    rejectAssignment
} from '../controllers/admin.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Admin Endpoints
router.route('/register').post(registerAdmin);                       // Admin registration
router.route('/login').post(loginAdmin);                             // Admin login
router.route('/assignments').get(verifyJWT, getAdminAssignments);   // Get assignments tagged to the admin
router.route('/assignments/:id/accept').post(verifyJWT, acceptAssignment); // Accept an assignment
router.route('/assignments/:id/reject').post(verifyJWT, rejectAssignment); // Reject an assignment

export default router;
