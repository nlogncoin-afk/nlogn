import jwt from 'jsonwebtoken';
import db from '../database/postgresDB.js';

export const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await db.users.findById(decoded.id);

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check if user is blocked
            if (req.user.isBlocked) {
                return res.status(403).json({
                    message: 'Your account has been blocked.',
                    reason: req.user.blockedReason || ''
                });
            }

            next();
        } catch (error) {
            // Handle specific JWT errors
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Session expired, please login again' });
            }
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};
