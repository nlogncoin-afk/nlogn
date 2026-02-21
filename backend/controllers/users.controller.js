import db from '../database/postgresDB.js';

// GET /api/users/admin/all — Admin gets all users
export const getAllUsers = async (req, res) => {
    try {
        const allUsers = await db.users.getAll();

        const users = await Promise.all(
            allUsers
                .filter(u => u.role !== 'admin')
                .map(async u => {
                    const bookings = await db.bookings.findByUserId(u.id);
                    return {
                        id: u.id,
                        fullName: u.fullName,
                        email: u.email,
                        role: u.role,
                        isBlocked: u.isBlocked || false,
                        blockedReason: u.blockedReason || '',
                        createdAt: u.createdAt,
                        bookingCount: bookings.length,
                        completedCount: bookings.filter(b => b.status === 'completed').length
                    };
                })
        );

        res.json({ success: true, users });
    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/users/admin/:id — Admin gets specific user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await db.users.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const userBookings = await db.bookings.findByUserId(user.id);
        const bookings = await Promise.all(
            userBookings.map(async b => {
                const slot = await db.meetingSlots.findById(b.slotId);
                const report = await db.interviewReports.findByBookingId(b.id);
                return { ...b, slot, report: report || null };
            })
        );

        const reports = await db.interviewReports.findByUserId(user.id);

        res.json({
            success: true,
            user: {
                id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isBlocked: user.isBlocked || false,
                blockedReason: user.blockedReason || '',
                createdAt: user.createdAt
            },
            bookings,
            reports
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/users/admin/:id/block — Admin blocks/unblocks a user
export const toggleBlockUser = async (req, res) => {
    try {
        const user = await db.users.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'admin') {
            return res.status(403).json({ message: 'Cannot block an admin' });
        }

        const { isBlocked, blockedReason } = req.body;

        const updated = await db.users.update(req.params.id, {
            isBlocked: Boolean(isBlocked),
            blockedReason: isBlocked ? (blockedReason || '') : ''
        });

        res.json({
            success: true,
            message: isBlocked ? 'User blocked' : 'User unblocked',
            user: {
                id: updated.id,
                fullName: updated.fullName,
                email: updated.email,
                isBlocked: updated.isBlocked,
                blockedReason: updated.blockedReason
            }
        });
    } catch (error) {
        console.error('Toggle block user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
