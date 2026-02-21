import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';
import {
    getAllUsers,
    getUserProfile,
    toggleBlockUser
} from '../controllers/users.controller.js';

const router = express.Router();

router.get('/admin/all', protect, adminOnly, getAllUsers);
router.get('/admin/:id', protect, adminOnly, getUserProfile);
router.patch('/admin/:id/block', protect, adminOnly, toggleBlockUser);

export default router;
