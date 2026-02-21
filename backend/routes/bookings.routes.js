import express from 'express';
import { check, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.middleware.js';
import { adminOnly } from '../middleware/admin.middleware.js';
import { handleUpload } from '../middleware/upload.middleware.js';
import {
    createBooking,
    getMyBookings,
    cancelBooking,
    getAllBookings,
    updateBookingStatus,
    submitReport,
    getReport,
    getMeetingLink,
    updateResume,
    getBookingById
} from '../controllers/bookings.controller.js';

const router = express.Router();

// Validation Middleware Wrapper
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), message: 'Invalid input data' });
    }
    next();
};

// User routes
router.post('/',
    protect,
    handleUpload,
    [
        check('slotId', 'Slot ID is required').notEmpty()
    ],
    validate,
    createBooking
);
router.get('/my-bookings', protect, getMyBookings);
router.delete('/:id', protect, cancelBooking);
router.get('/:id', protect, getBookingById);
router.get('/:id/meeting-link', protect, getMeetingLink);
router.get('/:id/report', protect, getReport);
router.patch('/:id/resume', protect, handleUpload, updateResume);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllBookings);
router.patch('/:id/status', protect, adminOnly, updateBookingStatus);
router.post('/:id/report', protect, adminOnly, submitReport);

export default router;
