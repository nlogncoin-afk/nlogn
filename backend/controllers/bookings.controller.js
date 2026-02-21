import db from '../database/postgresDB.js';
import path from 'path';

// POST /api/bookings — User books a slot (with resume upload)
export const createBooking = async (req, res) => {
    try {
        const { slotId } = req.body;
        if (!slotId) return res.status(400).json({ message: 'slotId is required' });

        const slot = await db.meetingSlots.findById(slotId);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        if (slot.status !== 'available') {
            return res.status(409).json({ message: 'Slot is no longer available' });
        }

        // Check slot is in the future (Parse as IST since input is local time)
        const slotStart = new Date(`${slot.date}T${slot.startTime}:00+05:30`);
        if (slotStart <= new Date()) {
            return res.status(400).json({ message: 'Cannot book a past slot' });
        }

        // Check duplicate booking by same user for same slot
        const existingBookings = await db.bookings.findBySlotId(slotId);
        const existingBooking = existingBookings.find(b => b.userId === req.user.id && b.status !== 'cancelled');
        if (existingBooking) {
            return res.status(409).json({ message: 'You have already booked this slot' });
        }

        // Handle resume file
        let resumeUrl = '';
        let resumeOriginalName = '';
        if (req.file) {
            resumeUrl = `/uploads/resumes/${req.file.filename}`;
            resumeOriginalName = req.file.originalname;
        }

        // Create booking
        const bookingId = 'booking-' + Date.now().toString() + Math.random().toString(36).substring(2, 9);
        const meetingLink = `https://meet.jit.si/antilog-${bookingId}`;

        const booking = await db.bookings.create({
            userId: req.user.id,
            slotId,
            meetingLink,
            resumeUrl,
            resumeOriginalName
        });

        // Mark slot as booked
        await db.meetingSlots.update(slotId, { status: 'booked' });

        res.status(201).json({
            success: true,
            booking,
            message: 'Interview booked successfully. Note: Bookings are non-refundable and cannot be cancelled.'
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/bookings/my-bookings — User gets their bookings with slot info
export const getMyBookings = async (req, res) => {
    try {
        const bookings = await db.bookings.findByUserId(req.user.id);

        const enriched = await Promise.all(bookings.map(async b => {
            const slot = await db.meetingSlots.findById(b.slotId);
            const report = await db.interviewReports.findByBookingId(b.id);
            return { ...b, slot, report: report || null };
        }));

        // Sort by bookedAt desc
        enriched.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

        res.json({ success: true, bookings: enriched });
    } catch (error) {
        console.error('Get my bookings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/bookings/:id — Always reject (non-refundable)
export const cancelBooking = async (req, res) => {
    return res.status(403).json({
        message: 'Bookings are non-refundable and cannot be cancelled.'
    });
};

// GET /api/bookings/admin/all — Admin gets all bookings fully populated
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await db.bookings.findAll();

        const enriched = await Promise.all(bookings.map(async b => {
            const user = await db.users.findById(b.userId);
            const slot = await db.meetingSlots.findById(b.slotId);
            const report = await db.interviewReports.findByBookingId(b.id);
            return {
                ...b,
                user: user ? { id: user.id, fullName: user.fullName, email: user.email } : null,
                slot,
                report: report || null
            };
        }));

        enriched.sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

        res.json({ success: true, bookings: enriched });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/bookings/:id/status — Admin updates booking status
export const updateBookingStatus = async (req, res) => {
    try {
        const booking = await db.bookings.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const { status } = req.body;
        const allowed = {
            'confirmed': ['under_review'],
            'under_review': ['completed', 'not_attended']
        };

        if (!allowed[booking.status] || !allowed[booking.status].includes(status)) {
            return res.status(400).json({
                message: `Cannot transition from '${booking.status}' to '${status}'`
            });
        }

        const updated = await db.bookings.update(req.params.id, { status });

        // If marking as not_attended, free up the slot
        if (status === 'not_attended') {
            await db.meetingSlots.update(booking.slotId, { status: 'available' });
        }

        res.json({ success: true, booking: updated });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/bookings/:id/report — Admin submits interview report
export const submitReport = async (req, res) => {
    try {
        const booking = await db.bookings.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'completed') {
            return res.status(400).json({ message: 'Report can only be submitted for completed interviews' });
        }

        // Check for duplicate
        const existingReport = await db.interviewReports.findByBookingId(booking.id);
        if (existingReport) {
            return res.status(409).json({ message: 'Report already submitted for this booking' });
        }

        const {
            problemSolving, dsaOptimization, communication,
            codeQuality, coreSubjects, interviewerComment,
            verdict, overallRating
        } = req.body;

        // Validate required fields
        if (!problemSolving || !dsaOptimization || !communication ||
            !codeQuality || !coreSubjects || !verdict || !overallRating) {
            return res.status(400).json({ message: 'All rating fields and verdict are required' });
        }

        const report = await db.interviewReports.create({
            bookingId: booking.id,
            userId: booking.userId,
            submittedBy: req.user.id,
            problemSolving: Number(problemSolving),
            dsaOptimization: Number(dsaOptimization),
            communication: Number(communication),
            codeQuality: Number(codeQuality),
            coreSubjects: Number(coreSubjects),
            interviewerComment: interviewerComment || '',
            verdict,
            overallRating: Number(overallRating)
        });

        // Link report to booking
        await db.bookings.update(booking.id, { interviewReport: report.id });

        res.status(201).json({ success: true, report });
    } catch (error) {
        console.error('Submit report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/bookings/:id/report — Get interview report (owner or admin)
export const getReport = async (req, res) => {
    try {
        const booking = await db.bookings.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        // Only booking owner or admin can view
        if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to view this report' });
        }

        const report = await db.interviewReports.findByBookingId(booking.id);
        if (!report) return res.status(404).json({ message: 'No report found for this booking' });

        res.json({ success: true, report });
    } catch (error) {
        console.error('Get report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/bookings/:id/meeting-link — Time-gated meeting link access
export const getMeetingLink = async (req, res) => {
    try {
        const booking = await db.bookings.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.status !== 'confirmed') {
            return res.status(400).json({ message: 'Meeting link only available for confirmed bookings' });
        }

        const slot = await db.meetingSlots.findById(booking.slotId);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        if (req.user.role === 'admin') {
            // Admin can access immediately; mark admin join
            await db.bookings.update(booking.id, { adminJoinedAt: new Date() });
            return res.json({ success: true, meetingLink: booking.meetingLink });
        }

        // User: check if within 5 minutes before slot start
        if (booking.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const slotStart = new Date(`${slot.date}T${slot.startTime}:00+05:30`);
        const fiveMinBefore = new Date(slotStart.getTime() - 5 * 60 * 1000);
        const now = new Date();

        if (now < fiveMinBefore) {
            return res.status(403).json({
                message: 'Meeting link not yet available',
                availableAt: fiveMinBefore.toISOString()
            });
        }

        // Mark user join
        await db.bookings.update(booking.id, { userJoinedAt: new Date() });

        res.json({ success: true, meetingLink: booking.meetingLink });
    } catch (error) {
        console.error('Get meeting link error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PATCH /api/bookings/:id/resume — User updates resume
export const updateResume = async (req, res) => {
    try {
        const booking = await db.bookings.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (booking.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        if (booking.status !== 'confirmed') {
            return res.status(400).json({ message: 'Cannot update resume after interview has started' });
        }

        // Check slot hasn't started
        const slot = await db.meetingSlots.findById(booking.slotId);
        if (slot) {
            // Auto expire 10 mins after slot start time (Parse as IST)
            const slotStart = new Date(`${slot.date}T${slot.startTime}:00+05:30`);
            if (new Date() >= slotStart) {
                return res.status(400).json({ message: 'Cannot update resume after interview start time' });
            }
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const resumeUrl = `/uploads/resumes/${req.file.filename}`;
        const updated = await db.bookings.update(booking.id, {
            resumeUrl,
            resumeOriginalName: req.file.originalname
        });

        res.json({ success: true, booking: updated });
    } catch (error) {
        console.error('Update resume error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/bookings/:id — Get single booking
export const getBookingById = async (req, res) => {
    try {
        const booking = await db.bookings.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        if (req.user.role !== 'admin' && booking.userId !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const slot = await db.meetingSlots.findById(booking.slotId);
        const report = await db.interviewReports.findByBookingId(booking.id);

        res.json({ success: true, booking: { ...booking, slot, report: report || null } });
    } catch (error) {
        console.error('Get booking error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
