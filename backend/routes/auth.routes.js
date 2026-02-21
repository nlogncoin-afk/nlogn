import express from 'express';
import rateLimit from 'express-rate-limit';
import { check, validationResult } from 'express-validator';
import {
    registerUser,
    loginUser,
    verifyEmail,
    resendOTP,
    forgotPassword,
    verifyResetOTP,
    resetPassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Strict rate limiter for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 requests per `window` (here, per 15 minutes)
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});

// Validation Middleware Wrapper
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array(), message: 'Invalid input data' });
    }
    next();
};

router.post('/register',
    authLimiter,
    [
        check('fullName', 'Full name is required and must be under 50 characters').trim().notEmpty().isLength({ max: 50 }),
        check('email', 'Please include a valid email').isEmail().normalizeEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    validate,
    registerUser
);

router.post('/login',
    authLimiter,
    [
        check('email', 'Please include a valid email').isEmail().normalizeEmail(),
        check('password', 'Password is required').exists()
    ],
    validate,
    loginUser
);
router.post('/verify-email', authLimiter, verifyEmail);
router.post('/resend-otp', authLimiter, resendOTP);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/verify-reset-otp', authLimiter, verifyResetOTP);
router.post('/reset-password', authLimiter, resetPassword);

export default router;
