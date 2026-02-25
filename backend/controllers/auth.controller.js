import db from '../database/postgresDB.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateOTP } from '../utils/generateOTP.js';
import { sendEmail } from '../utils/sendEmail.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
        const emailDomain = email.split('@')[1]?.toLowerCase();

        if (!allowedDomains.includes(emailDomain)) {
            return res.status(400).json({ message: 'Please use a major email provider (Gmail, Yahoo, Outlook, etc.)' });
        }

        const userExists = await db.users.findByEmail(email);

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        const pendingUser = await db.pendingUsers.create({
            fullName,
            email,
            password: hashedPassword,
            role: 'user',
            otp,
            otpExpiry,
        });

        if (pendingUser) {
            await sendEmail(email, 'Verify your email', `Your OTP is ${otp}`);

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please verify your email.',
                userId: pendingUser.id,
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify email with OTP
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        // Check if it's a pending user (new registration flow)
        const pendingUser = await db.pendingUsers.findById(userId);

        if (pendingUser) {
            if (pendingUser.otp !== otp || new Date() > new Date(pendingUser.otpExpiry)) {
                return res.status(400).json({ message: 'Invalid or expired OTP' });
            }

            // Move to real users table
            const newUser = await db.users.create({
                fullName: pendingUser.fullName,
                email: pendingUser.email,
                password: pendingUser.password,
                role: pendingUser.role,
                isVerified: true, // Auto-verified
            });

            // Delete from pending
            await db.pendingUsers.delete(userId);

            return res.json({
                success: true,
                message: 'Email verified successfully',
                token: generateToken(newUser.id),
                user: {
                    id: newUser.id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    role: newUser.role,
                },
            });
        }

        // Fallback: Check if it's an existing unverified user (legacy support)
        const user = await db.users.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        await db.users.update(userId, {
            isVerified: true,
            otp: null,
            otpExpiry: null,
        });

        res.json({
            success: true,
            message: 'Email verified successfully',
            token: generateToken(user.id),
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await db.users.findByEmail(email);

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isVerified) {
                return res.status(401).json({ message: 'Please verify your email first', userId: user.id });
            }

            res.json({
                success: true,
                message: 'Login successful',
                token: generateToken(user.id),
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                },
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
export const resendOTP = async (req, res) => {
    try {
        const { userId, email } = req.body;
        let user;

        if (userId) {
            user = await db.users.findById(userId);
            if (!user) {
                user = await db.pendingUsers.findById(userId);
            }
        } else if (email) {
            user = await db.users.findByEmail(email);
            // Pending users don't store by email index in this simple DB, but we can iterate or just rely on ID for now.
            // But frontend verify page knows email.
            // Let's assume we can find pending by email if needed, but VerifyEmail.jsx has userId (tempId).
            // inMemoryDB doesn't have findByEmail for pendingUsers. I should add it or just rely on ID.
            // The frontend VerifyEmail.jsx has `tempId` which is the ID. So ID lookup is enough for the verify page.
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        // Check if it's a pending user to update
        if (await db.pendingUsers.findById(user.id)) {
            await db.pendingUsers.update(user.id, { otp, otpExpiry });
        } else {
            await db.users.update(user.id, { otp, otpExpiry });
        }

        await sendEmail(user.email, 'Your New OTP', `Your new OTP is ${otp}`);

        res.json({ success: true, message: 'OTP resent successfully' });

    } catch (error) {
        console.error('Resend OTP Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}


// @desc    Forgot Password - Send OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await db.users.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        await db.users.update(user.id, { otp, otpExpiry });
        await sendEmail(user.email, 'Password Reset OTP', `Your OTP for password reset is ${otp}`);

        res.json({ success: true, message: 'OTP sent to your email', userId: user.id });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify Reset OTP
// @route   POST /api/auth/verify-reset-otp
// @access  Public
export const verifyResetOTP = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await db.users.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.otp !== otp || new Date() > new Date(user.otpExpiry)) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Generate a temporary token for reset password
        const resetToken = jwt.sign({ id: user.id, purpose: 'reset-password' }, process.env.JWT_SECRET, { expiresIn: '15m' });

        res.json({ success: true, message: 'OTP verified', resetToken });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;

        let decoded;
        try {
            decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        if (decoded.purpose !== 'reset-password') {
            return res.status(400).json({ message: 'Invalid token purpose' });
        }

        const user = await db.users.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.users.update(user.id, {
            password: hashedPassword,
            otp: null,
            otpExpiry: null
        });

        res.json({ success: true, message: 'Password reset successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
