import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';
import { getAnalytics } from '../controllers/admin.controller.js';

const router = express.Router();

router.get('/analytics', protect, adminOnly, getAnalytics);

export default router;
