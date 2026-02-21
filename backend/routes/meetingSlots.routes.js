import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';
import {
    createBatchSlots,
    getAllSlots,
    getAvailableSlots,
    updateSlot,
    deleteSlot
} from '../controllers/meetingSlots.controller.js';

const router = express.Router();

// User routes
router.get('/available', protect, getAvailableSlots);

// Admin routes
router.post('/batch', protect, adminOnly, createBatchSlots);
router.get('/admin/all', protect, adminOnly, getAllSlots);
router.put('/:id', protect, adminOnly, updateSlot);
router.delete('/:id', protect, adminOnly, deleteSlot);

export default router;
