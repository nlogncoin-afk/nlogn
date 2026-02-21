import db from '../database/inMemoryDB.js';

// GET /api/admin/analytics — Aggregated analytics for admin dashboard
export const getAnalytics = async (req, res) => {
    try {
        const users = db.users.getAll().filter(u => u.role !== 'admin');
        const allBookings = db.bookings.findAll();
        const allSlots = db.meetingSlots.findAll();

        const now = new Date();
        const today = now.toISOString().split('T')[0]; // 'YYYY-MM-DD'

        // Stats
        const totalUsers = users.length;
        const totalBookings = allBookings.length;
        const completedCount = allBookings.filter(b => b.status === 'completed').length;
        const notAttendedCount = allBookings.filter(b => b.status === 'not_attended').length;
        const confirmedCount = allBookings.filter(b => b.status === 'confirmed').length;
        const underReviewCount = allBookings.filter(b => b.status === 'under_review').length;

        // Interviews today
        const interviewsToday = allBookings.filter(b => {
            const slot = db.meetingSlots.findById(b.slotId);
            return slot && slot.date === today;
        }).length;

        // Upcoming confirmed
        const upcomingConfirmed = allBookings.filter(b => {
            if (b.status !== 'confirmed') return false;
            const slot = db.meetingSlots.findById(b.slotId);
            if (!slot) return false;
            const slotStart = new Date(`${slot.date}T${slot.startTime}:00`);
            return slotStart > now;
        }).length;

        // Rates
        const cancellationRate = totalBookings > 0
            ? ((notAttendedCount / totalBookings) * 100).toFixed(1)
            : 0;
        const completionRate = totalBookings > 0
            ? ((completedCount / totalBookings) * 100).toFixed(1)
            : 0;

        // Bookings over last 30 days (for line chart)
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const count = allBookings.filter(b => {
                const bookedDate = new Date(b.bookedAt).toISOString().split('T')[0];
                return bookedDate === dateStr;
            }).length;
            last30Days.push({ date: dateStr, bookings: count });
        }

        // Status distribution (for pie chart)
        const statusDistribution = [
            { name: 'Confirmed', value: confirmedCount },
            { name: 'Completed', value: completedCount },
            { name: 'Not Attended', value: notAttendedCount },
            { name: 'Under Review', value: underReviewCount }
        ];

        // Interviews per day this week (for bar chart)
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Sunday
        const thisWeek = [];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (let i = 0; i < 7; i++) {
            const d = new Date(weekStart);
            d.setDate(weekStart.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            const count = allBookings.filter(b => {
                const slot = db.meetingSlots.findById(b.slotId);
                return slot && slot.date === dateStr;
            }).length;
            thisWeek.push({ day: dayNames[i], interviews: count });
        }

        // Next 5 upcoming confirmed bookings
        const upcomingBookings = allBookings
            .filter(b => {
                if (b.status !== 'confirmed') return false;
                const slot = db.meetingSlots.findById(b.slotId);
                if (!slot) return false;
                return new Date(`${slot.date}T${slot.startTime}:00`) > now;
            })
            .map(b => {
                const slot = db.meetingSlots.findById(b.slotId);
                const user = db.users.findById(b.userId);
                return {
                    id: b.id,
                    userName: user?.fullName || 'Unknown',
                    userEmail: user?.email || '',
                    slotDate: slot.date,
                    slotTime: slot.startTime,
                    resumeUrl: b.resumeUrl
                };
            })
            .sort((a, b) => {
                const aTime = new Date(`${a.slotDate}T${a.slotTime}:00`);
                const bTime = new Date(`${b.slotDate}T${b.slotTime}:00`);
                return aTime - bTime;
            })
            .slice(0, 5);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalBookings,
                interviewsToday,
                upcomingConfirmed,
                cancellationRate: Number(cancellationRate),
                completionRate: Number(completionRate)
            },
            charts: {
                last30Days,
                statusDistribution,
                thisWeek
            },
            upcomingBookings
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
