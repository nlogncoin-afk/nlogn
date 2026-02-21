import fs from 'fs';
import path from 'path';

// Persistence file path
const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

const loadDB = () => {
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            return {
                users: new Map(data.users || []),
                meetingSlots: new Map(data.meetingSlots || []),
                bookings: new Map(data.bookings || []),
                pendingUsers: new Map(data.pendingUsers || []),
                interviewReports: new Map(data.interviewReports || [])
            };
        }
    } catch (e) {
        console.error('Failed to load DB', e);
    }
    return {
        users: new Map(),
        meetingSlots: new Map(),
        bookings: new Map(),
        pendingUsers: new Map(),
        interviewReports: new Map()
    };
};

const { users, meetingSlots, bookings, pendingUsers, interviewReports } = loadDB();

// --- Default Admin Seeding ---
const DEFAULT_ADMIN_EMAIL = 'admin@test.com';
const STARTUP_ADMIN_HASH = '$2b$10$uC8.iRcTD2onKRlHYBCTYuskvqBF5MKpXnog6KinF7fkCYpoR1tYi'; // 'admin123'

let adminExists = false;
for (let user of users.values()) {
    if (user.email === DEFAULT_ADMIN_EMAIL) {
        adminExists = true;
        break;
    }
}

const saveDB = () => {
    try {
        // Ensure directory exists
        const dir = path.dirname(DB_FILE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        const data = {
            users: Array.from(users.entries()),
            meetingSlots: Array.from(meetingSlots.entries()),
            bookings: Array.from(bookings.entries()),
            pendingUsers: Array.from(pendingUsers.entries()),
            interviewReports: Array.from(interviewReports.entries())
        };
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.error('Failed to save DB', e);
    }
};

if (!adminExists) {
    const id = Date.now().toString() + Math.random().toString(36).substring(2);
    const adminUser = {
        id,
        fullName: 'Test Admin',
        email: DEFAULT_ADMIN_EMAIL,
        password: STARTUP_ADMIN_HASH,
        role: 'admin',
        isVerified: true,
        isBlocked: false,
        blockedReason: '',
        createdAt: new Date(),
        updatedAt: new Date()
    };
    users.set(id, adminUser);
    console.log(`[DB] Default admin created: ${DEFAULT_ADMIN_EMAIL}`);
    saveDB();
}

// ============================================================
// Database API
// ============================================================

const db = {
    // --- USERS ---
    users: {
        create: (userData) => {
            const id = Date.now().toString() + Math.random().toString(36).substring(2);
            const user = {
                id,
                ...userData,
                isBlocked: false,
                blockedReason: '',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            users.set(id, user);
            saveDB();
            console.log(`[DB] Created user: ${user.email}`);
            return user;
        },
        findById: (id) => users.get(id) || null,
        findByEmail: (email) => {
            for (let user of users.values()) {
                if (user.email === email) return user;
            }
            return null;
        },
        update: (id, updates) => {
            const user = users.get(id);
            if (user) {
                const updated = { ...user, ...updates, updatedAt: new Date() };
                users.set(id, updated);
                saveDB();
                return updated;
            }
            return null;
        },
        delete: (id) => {
            const result = users.delete(id);
            saveDB();
            return result;
        },
        getAll: () => Array.from(users.values())
    },

    // --- MEETING SLOTS ---
    meetingSlots: {
        create: (slotData) => {
            const id = 'slot-' + Date.now().toString() + Math.random().toString(36).substring(2, 9);
            const slot = {
                id,
                date: slotData.date,           // 'YYYY-MM-DD'
                startTime: slotData.startTime,  // 'HH:MM'
                endTime: slotData.endTime,      // 'HH:MM'
                duration: slotData.duration,    // minutes
                status: 'available',
                createdBy: slotData.createdBy || null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            meetingSlots.set(id, slot);
            saveDB();
            return slot;
        },
        findById: (id) => meetingSlots.get(id) || null,
        findAll: () => Array.from(meetingSlots.values()),
        findAvailable: () => {
            const now = new Date();
            return Array.from(meetingSlots.values()).filter(slot => {
                if (slot.status !== 'available') return false;
                // Construct full datetime from date + startTime
                const slotStart = new Date(`${slot.date}T${slot.startTime}:00`);
                return slotStart > now;
            });
        },
        findByDate: (date) => {
            return Array.from(meetingSlots.values()).filter(slot => slot.date === date);
        },
        update: (id, updates) => {
            const slot = meetingSlots.get(id);
            if (slot) {
                const updated = { ...slot, ...updates, updatedAt: new Date() };
                meetingSlots.set(id, updated);
                saveDB();
                return updated;
            }
            return null;
        },
        delete: (id) => {
            const result = meetingSlots.delete(id);
            saveDB();
            return result;
        }
    },

    // --- BOOKINGS ---
    bookings: {
        create: (bookingData) => {
            const id = 'booking-' + Date.now().toString() + Math.random().toString(36).substring(2, 9);
            const booking = {
                id,
                userId: bookingData.userId,
                slotId: bookingData.slotId,
                status: 'confirmed',
                bookedAt: new Date(),
                meetingLink: bookingData.meetingLink || '',
                resumeUrl: bookingData.resumeUrl || '',
                resumeOriginalName: bookingData.resumeOriginalName || '',
                userJoinedAt: null,
                adminJoinedAt: null,
                autoExpiredAt: null,
                interviewReport: null
            };
            bookings.set(id, booking);
            saveDB();
            return booking;
        },
        findById: (id) => bookings.get(id) || null,
        findAll: () => Array.from(bookings.values()),
        findByUserId: (userId) => {
            return Array.from(bookings.values()).filter(b => b.userId === userId);
        },
        findBySlotId: (slotId) => {
            return Array.from(bookings.values()).filter(b => b.slotId === slotId);
        },
        update: (id, updates) => {
            const booking = bookings.get(id);
            if (booking) {
                const updated = { ...booking, ...updates };
                bookings.set(id, updated);
                saveDB();
                return updated;
            }
            return null;
        },
        delete: (id) => {
            const result = bookings.delete(id);
            saveDB();
            return result;
        }
    },

    // --- PENDING USERS ---
    pendingUsers: {
        create: (userData) => {
            const id = 'pending-' + Date.now().toString() + Math.random().toString(36).substring(2, 9);
            const pendingUser = { id, ...userData, createdAt: new Date() };
            pendingUsers.set(id, pendingUser);
            saveDB();
            console.log(`[DB] Created pending user: ${pendingUser.email}`);
            return pendingUser;
        },
        findById: (id) => pendingUsers.get(id) || null,
        update: (id, updates) => {
            const pu = pendingUsers.get(id);
            if (pu) {
                const updated = { ...pu, ...updates };
                pendingUsers.set(id, updated);
                saveDB();
                return updated;
            }
            return null;
        },
        delete: (id) => {
            const result = pendingUsers.delete(id);
            saveDB();
            return result;
        }
    },

    // --- INTERVIEW REPORTS ---
    interviewReports: {
        create: (reportData) => {
            const id = 'report-' + Date.now().toString() + Math.random().toString(36).substring(2, 9);
            const report = {
                id,
                bookingId: reportData.bookingId,
                userId: reportData.userId,
                submittedBy: reportData.submittedBy,
                submittedAt: new Date(),
                problemSolving: reportData.problemSolving,
                dsaOptimization: reportData.dsaOptimization,
                communication: reportData.communication,
                codeQuality: reportData.codeQuality,
                coreSubjects: reportData.coreSubjects,
                interviewerComment: reportData.interviewerComment || '',
                verdict: reportData.verdict,
                overallRating: reportData.overallRating
            };
            interviewReports.set(id, report);
            saveDB();
            return report;
        },
        findById: (id) => interviewReports.get(id) || null,
        findByBookingId: (bookingId) => {
            for (let r of interviewReports.values()) {
                if (r.bookingId === bookingId) return r;
            }
            return null;
        },
        findByUserId: (userId) => {
            return Array.from(interviewReports.values()).filter(r => r.userId === userId);
        },
        findAll: () => Array.from(interviewReports.values()),
        update: (id, updates) => {
            const report = interviewReports.get(id);
            if (report) {
                const updated = { ...report, ...updates };
                interviewReports.set(id, updated);
                saveDB();
                return updated;
            }
            return null;
        },
        delete: (id) => {
            const result = interviewReports.delete(id);
            saveDB();
            return result;
        }
    }
};

export default db;
