import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import meetingSlotRoutes from './routes/meetingSlots.routes.js';
import bookingRoutes from './routes/bookings.routes.js';
import usersRoutes from './routes/users.routes.js';
import adminRoutes from './routes/admin.routes.js';
import db from './database/inMemoryDB.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// Trust the first proxy (Render)
// Required for express-rate-limit to accurately identify IPs
app.set('trust proxy', 1);

// Configure CORS
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Define allowed URLs dynamically
        const localOrigin = 'http://localhost:5173';
        const prodOrigin = process.env.FRONTEND_URL;

        // If the origin exactly matches local or production (ignoring trailing slashes)
        // or if production URL isn't set yet (we just allow everything temporarily to prevent 500s)
        if (!prodOrigin) {
            return callback(null, true);
        }

        // Clean up URLs to compare without trailing slashes
        const cleanOrigin = origin.replace(/\/$/, "");
        const cleanProd = prodOrigin.replace(/\/$/, "");

        if (cleanOrigin === localOrigin || cleanOrigin === cleanProd || cleanOrigin.includes('vercel.app')) {
            return callback(null, true);
        }

        return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
    },
    credentials: true,
}));

// Global Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meeting-slots', meetingSlotRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// ============================================================
// Auto-Expiry Job: every 2 minutes
// Marks confirmed bookings as not_attended if slot start + 10min < now
// and user never joined (userJoinedAt is null)
// ============================================================
const runAutoExpiry = () => {
    try {
        const now = new Date();
        const bookings = db.bookings.findAll();

        for (const booking of bookings) {
            if (booking.status !== 'confirmed') continue;
            if (booking.userJoinedAt) continue; // user joined, skip

            const slot = db.meetingSlots.findById(booking.slotId);
            if (!slot) continue;

            const slotStart = new Date(`${slot.date}T${slot.startTime}:00`);
            const expireThreshold = new Date(slotStart.getTime() + 10 * 60 * 1000);

            if (now > expireThreshold) {
                db.bookings.update(booking.id, {
                    status: 'not_attended',
                    autoExpiredAt: now
                });
                db.meetingSlots.update(booking.slotId, { status: 'available' });
                console.log(`[Auto-Expiry] Booking ${booking.id} marked as not_attended`);
            }
        }
    } catch (error) {
        console.error('[Auto-Expiry] Error:', error);
    }
};

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

    // Start auto-expiry job
    setInterval(runAutoExpiry, 2 * 60 * 1000);
    console.log('[Auto-Expiry] Job started - runs every 2 minutes');
});
