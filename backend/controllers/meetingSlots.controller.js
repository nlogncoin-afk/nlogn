import db from '../database/postgresDB.js';

// Helper: check if two time ranges overlap
const timesOverlap = (start1, end1, start2, end2) => {
    return start1 < end2 && start2 < end1;
};

// POST /api/meeting-slots/batch — Admin batch-create slots
export const createBatchSlots = async (req, res) => {
    try {
        const { date, startTime, endTime, duration } = req.body;

        if (!date || !startTime || !endTime || !duration) {
            return res.status(400).json({ message: 'date, startTime, endTime, and duration are required' });
        }

        const dur = parseInt(duration);
        if (isNaN(dur) || dur <= 0) {
            return res.status(400).json({ message: 'duration must be a positive number' });
        }

        // Parse times into minutes from midnight for easy arithmetic
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const startMinutes = sh * 60 + sm;
        const endMinutes = eh * 60 + em;

        if (startMinutes >= endMinutes) {
            return res.status(400).json({ message: 'startTime must be before endTime' });
        }

        // Generate slot intervals
        const slotsToCreate = [];
        let current = startMinutes;
        while (current + dur <= endMinutes) {
            const slotStart = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`;
            const slotEnd = `${String(Math.floor((current + dur) / 60)).padStart(2, '0')}:${String((current + dur) % 60).padStart(2, '0')}`;
            slotsToCreate.push({ start: slotStart, end: slotEnd });
            current += dur;
        }

        if (slotsToCreate.length === 0) {
            return res.status(400).json({ message: 'No slots can be generated with the given time range and duration' });
        }

        // Check for overlaps with existing slots on the same date
        const existingSlots = (await db.meetingSlots.findByDate(date))
            .filter(s => s.status !== 'cancelled');

        for (const newSlot of slotsToCreate) {
            for (const existing of existingSlots) {
                if (timesOverlap(newSlot.start, newSlot.end, existing.startTime, existing.endTime)) {
                    return res.status(400).json({
                        message: `Time conflict: ${newSlot.start}-${newSlot.end} overlaps with existing slot ${existing.startTime}-${existing.endTime}`
                    });
                }
            }
        }

        // Create all slots sequentially or in parallel
        const created = await Promise.all(slotsToCreate.map(s =>
            db.meetingSlots.create({
                date,
                startTime: s.start,
                endTime: s.end,
                duration: dur,
                createdBy: req.user.id
            })
        ));

        res.status(201).json({ success: true, slots: created, count: created.length });
    } catch (error) {
        console.error('Batch slot creation error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/meeting-slots/admin/all — Admin gets all slots with booking info
export const getAllSlots = async (req, res) => {
    try {
        const slots = await db.meetingSlots.findAll();

        const enriched = await Promise.all(slots.map(async slot => {
            const bookings = await db.bookings.findBySlotId(slot.id);
            const booking = bookings.find(b => b.status !== 'cancelled');

            if (booking) {
                const user = await db.users.findById(booking.userId);
                return {
                    ...slot,
                    booking: {
                        id: booking.id,
                        userId: booking.userId,
                        userName: user?.fullName || 'Unknown',
                        userEmail: user?.email || '',
                        resumeUrl: booking.resumeUrl,
                        status: booking.status
                    }
                };
            }
            return { ...slot, booking: null };
        }));

        // Sort by date desc, then startTime desc
        enriched.sort((a, b) => {
            if (a.date !== b.date) return b.date.localeCompare(a.date);
            return b.startTime.localeCompare(a.startTime);
        });

        res.json({ success: true, slots: enriched });
    } catch (error) {
        console.error('Get all slots error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/meeting-slots/available — User gets available future slots
export const getAvailableSlots = async (req, res) => {
    try {
        const slots = await db.meetingSlots.findAvailable();

        // Sort by date asc, then startTime asc
        slots.sort((a, b) => {
            if (a.date !== b.date) return a.date.localeCompare(b.date);
            return a.startTime.localeCompare(b.startTime);
        });

        res.json({ success: true, slots });
    } catch (error) {
        console.error('Get available slots error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/meeting-slots/:id — Admin updates a slot
export const updateSlot = async (req, res) => {
    try {
        const slot = await db.meetingSlots.findById(req.params.id);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        if (slot.status === 'booked') {
            return res.status(403).json({ message: 'Cannot modify a booked slot' });
        }

        const { date, startTime, endTime, status } = req.body;
        const updates = {};

        if (status) {
            if (status === 'cancelled' && slot.status !== 'booked') {
                updates.status = 'cancelled';
            } else if (status !== 'cancelled') {
                updates.status = status;
            }
        }

        if (date) updates.date = date;
        if (startTime) updates.startTime = startTime;
        if (endTime) updates.endTime = endTime;

        // Check for conflicts if time/date changed
        if (updates.date || updates.startTime || updates.endTime) {
            const checkDate = updates.date || slot.date;
            const checkStart = updates.startTime || slot.startTime;
            const checkEnd = updates.endTime || slot.endTime;

            const existing = (await db.meetingSlots.findByDate(checkDate))
                .filter(s => s.id !== slot.id && s.status !== 'cancelled');

            for (const other of existing) {
                if (timesOverlap(checkStart, checkEnd, other.startTime, other.endTime)) {
                    return res.status(400).json({
                        message: `Time conflict with slot ${other.startTime}-${other.endTime}`
                    });
                }
            }
        }

        const updated = await db.meetingSlots.update(req.params.id, updates);
        res.json({ success: true, slot: updated });
    } catch (error) {
        console.error('Update slot error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// DELETE /api/meeting-slots/:id — Admin deletes a slot
export const deleteSlot = async (req, res) => {
    try {
        const slot = await db.meetingSlots.findById(req.params.id);
        if (!slot) return res.status(404).json({ message: 'Slot not found' });

        if (slot.status === 'booked') {
            return res.status(403).json({ message: 'Cannot delete a booked slot' });
        }

        await db.meetingSlots.delete(req.params.id);
        res.json({ success: true, message: 'Slot deleted' });
    } catch (error) {
        console.error('Delete slot error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
