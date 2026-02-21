import pg from 'pg';

const { Pool } = pg;

// We use process.env.DATABASE_URL
// Add ssl: true if it's external, but for internal Render URLs it's usually inside VPC without strict SSL,
// but Render requires SSL for external. Let's provide a flexible config.
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL.includes('internal')
        ? { rejectUnauthorized: false }
        : false
});

export const initDB = async () => {
    try {
        const client = await pool.connect();
        console.log('[DB] Connected to PostgreSQL');

        // Check if tables exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255) PRIMARY KEY,
                "fullName" VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                "isVerified" BOOLEAN DEFAULT false,
                "isBlocked" BOOLEAN DEFAULT false,
                "blockedReason" TEXT,
                otp VARCHAR(100),
                "otpExpiry" TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS pending_users (
                id VARCHAR(255) PRIMARY KEY,
                "fullName" VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user',
                otp VARCHAR(100),
                "otpExpiry" TIMESTAMP,
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS meeting_slots (
                id VARCHAR(255) PRIMARY KEY,
                date VARCHAR(50) NOT NULL,
                "startTime" VARCHAR(50) NOT NULL,
                "endTime" VARCHAR(50) NOT NULL,
                duration INTEGER NOT NULL,
                status VARCHAR(50) DEFAULT 'available',
                "createdBy" VARCHAR(255),
                "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS bookings (
                id VARCHAR(255) PRIMARY KEY,
                "userId" VARCHAR(255) NOT NULL,
                "slotId" VARCHAR(255) NOT NULL,
                status VARCHAR(50) DEFAULT 'confirmed',
                "bookedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "meetingLink" TEXT,
                "resumeUrl" TEXT,
                "resumeOriginalName" TEXT,
                "userJoinedAt" TIMESTAMP,
                "adminJoinedAt" TIMESTAMP,
                "autoExpiredAt" TIMESTAMP,
                "interviewReport" VARCHAR(255)
            );

            CREATE TABLE IF NOT EXISTS interview_reports (
                id VARCHAR(255) PRIMARY KEY,
                "bookingId" VARCHAR(255) NOT NULL,
                "userId" VARCHAR(255) NOT NULL,
                "submittedBy" VARCHAR(255) NOT NULL,
                "submittedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "problemSolving" INTEGER NOT NULL,
                "dsaOptimization" INTEGER NOT NULL,
                communication INTEGER NOT NULL,
                "codeQuality" INTEGER NOT NULL,
                "coreSubjects" INTEGER NOT NULL,
                "interviewerComment" TEXT,
                verdict VARCHAR(50) NOT NULL,
                "overallRating" INTEGER NOT NULL
            );
        `);
        console.log('[DB] PostgreSQL tables successfully verified/created');

        // Seed default admin if missing
        const DEFAULT_ADMIN_EMAIL = 'admin@test.com';
        const STARTUP_ADMIN_HASH = '$2b$10$uC8.iRcTD2onKRlHYBCTYuskvqBF5MKpXnog6KinF7fkCYpoR1tYi'; // 'admin123'

        const { rowCount } = await client.query('SELECT * FROM users WHERE email = $1', [DEFAULT_ADMIN_EMAIL]);
        if (rowCount === 0) {
            const adminId = Date.now().toString() + Math.random().toString(36).substring(2);
            await client.query(`
                INSERT INTO users (id, "fullName", email, password, role, "isVerified", "isBlocked")
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [adminId, 'Test Admin', DEFAULT_ADMIN_EMAIL, STARTUP_ADMIN_HASH, 'admin', true, false]);
            console.log(`[DB] Default admin created: ${DEFAULT_ADMIN_EMAIL}`);
        }

        client.release();
    } catch (e) {
        console.error('[DB] PostgreSQL initialization failed:', e);
    }
};

// Helper function to build INSERT queries
const insertQuery = (table, obj) => {
    const keys = Object.keys(obj);
    const cols = keys.map(k => `"${k}"`).join(', ');
    const params = keys.map((_, i) => `$${i + 1}`).join(', ');
    const values = Object.values(obj).map(v => v === undefined ? null : v);
    return { text: `INSERT INTO ${table} (${cols}) VALUES (${params}) RETURNING *`, values };
};

// Helper function to build UPDATE queries
const updateQuery = (table, id, obj) => {
    if (Object.keys(obj).length === 0) return null;
    const keys = Object.keys(obj);
    const sets = keys.map((k, i) => `"${k}" = $${i + 1}`).join(', ');
    const values = [...Object.values(obj).map(v => v === undefined ? null : v), id];
    return { text: `UPDATE ${table} SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`, values };
};

// ============================================================
// Database API - Async Drop-In Replacement
// ============================================================

const db = {
    // --- USERS ---
    users: {
        create: async (userData) => {
            const id = Date.now().toString() + Math.random().toString(36).substring(2);
            const user = {
                id,
                ...userData,
                isBlocked: false,
                blockedReason: '',
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const query = insertQuery('users', user);
            const res = await pool.query(query);
            return res.rows[0];
        },
        findById: async (id) => {
            const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            return res.rows[0] || null;
        },
        findByEmail: async (email) => {
            const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            return res.rows[0] || null;
        },
        update: async (id, updates) => {
            const query = updateQuery('users', id, { ...updates, updatedAt: new Date() });
            if (!query) return null;
            const res = await pool.query(query);
            return res.rows[0] || null;
        },
        delete: async (id) => {
            await pool.query('DELETE FROM users WHERE id = $1', [id]);
            return true;
        },
        getAll: async () => {
            const res = await pool.query('SELECT * FROM users');
            return res.rows;
        }
    },

    // --- MEETING SLOTS ---
    meetingSlots: {
        create: async (slotData) => {
            const id = 'slot-' + Date.now().toString() + Math.random().toString(36).substring(2, 9);
            const slot = {
                id,
                date: slotData.date,
                startTime: slotData.startTime,
                endTime: slotData.endTime,
                duration: slotData.duration,
                status: 'available',
                createdBy: slotData.createdBy || null,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const query = insertQuery('meeting_slots', slot);
            const res = await pool.query(query);
            return res.rows[0];
        },
        findById: async (id) => {
            const res = await pool.query('SELECT * FROM meeting_slots WHERE id = $1', [id]);
            return res.rows[0] || null;
        },
        findAll: async () => {
            const res = await pool.query('SELECT * FROM meeting_slots');
            return res.rows;
        },
        findAvailable: async () => {
            const res = await pool.query('SELECT * FROM meeting_slots WHERE status = $1', ['available']);
            const now = new Date();
            return res.rows.filter(slot => {
                const slotStart = new Date(`${slot.date}T${slot.startTime}:00+05:30`);
                return slotStart > now;
            });
        },
        findByDate: async (date) => {
            const res = await pool.query('SELECT * FROM meeting_slots WHERE date = $1', [date]);
            return res.rows;
        },
        update: async (id, updates) => {
            const query = updateQuery('meeting_slots', id, { ...updates, updatedAt: new Date() });
            if (!query) return null;
            const res = await pool.query(query);
            return res.rows[0] || null;
        },
        delete: async (id) => {
            await pool.query('DELETE FROM meeting_slots WHERE id = $1', [id]);
            return true;
        }
    },

    // --- BOOKINGS ---
    bookings: {
        create: async (bookingData) => {
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
            const query = insertQuery('bookings', booking);
            const res = await pool.query(query);
            return res.rows[0];
        },
        findById: async (id) => {
            const res = await pool.query('SELECT * FROM bookings WHERE id = $1', [id]);
            return res.rows[0] || null;
        },
        findAll: async () => {
            const res = await pool.query('SELECT * FROM bookings');
            return res.rows;
        },
        findByUserId: async (userId) => {
            const res = await pool.query('SELECT * FROM bookings WHERE "userId" = $1', [userId]);
            return res.rows;
        },
        findBySlotId: async (slotId) => {
            const res = await pool.query('SELECT * FROM bookings WHERE "slotId" = $1', [slotId]);
            return res.rows;
        },
        update: async (id, updates) => {
            const query = updateQuery('bookings', id, updates);
            if (!query) return null;
            const res = await pool.query(query);
            return res.rows[0] || null;
        },
        delete: async (id) => {
            await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
            return true;
        }
    },

    // --- PENDING USERS ---
    pendingUsers: {
        create: async (userData) => {
            const id = 'pending-' + Date.now().toString() + Math.random().toString(36).substring(2, 9);
            const pendingUser = { id, ...userData, createdAt: new Date() };
            const query = insertQuery('pending_users', pendingUser);
            const res = await pool.query(query);
            return res.rows[0];
        },
        findById: async (id) => {
            const res = await pool.query('SELECT * FROM pending_users WHERE id = $1', [id]);
            return res.rows[0] || null;
        },
        update: async (id, updates) => {
            const query = updateQuery('pending_users', id, updates);
            if (!query) return null;
            const res = await pool.query(query);
            return res.rows[0] || null;
        },
        delete: async (id) => {
            await pool.query('DELETE FROM pending_users WHERE id = $1', [id]);
            return true;
        }
    },

    // --- INTERVIEW REPORTS ---
    interviewReports: {
        create: async (reportData) => {
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
            const query = insertQuery('interview_reports', report);
            const res = await pool.query(query);
            return res.rows[0];
        },
        findById: async (id) => {
            const res = await pool.query('SELECT * FROM interview_reports WHERE id = $1', [id]);
            return res.rows[0] || null;
        },
        findByBookingId: async (bookingId) => {
            const res = await pool.query('SELECT * FROM interview_reports WHERE "bookingId" = $1', [bookingId]);
            return res.rows[0] || null;
        },
        findByUserId: async (userId) => {
            const res = await pool.query('SELECT * FROM interview_reports WHERE "userId" = $1', [userId]);
            return res.rows;
        },
        findAll: async () => {
            const res = await pool.query('SELECT * FROM interview_reports');
            return res.rows;
        },
        update: async (id, updates) => {
            const query = updateQuery('interview_reports', id, updates);
            if (!query) return null;
            const res = await pool.query(query);
            return res.rows[0] || null;
        },
        delete: async (id) => {
            await pool.query('DELETE FROM interview_reports WHERE id = $1', [id]);
            return true;
        }
    }
};

export default db;
