import axios from 'axios';
import fs from 'fs';
import path from 'path';

const API_URL = 'http://localhost:5000/api/auth';
const SLOT_API_URL = 'http://localhost:5000/api/meeting-slots';
const BOOKING_API_URL = 'http://localhost:5000/api/bookings';
const LOG_FILE = 'C:\\Users\\sanjo\\.gemini\\antigravity\\brain\\1cdf95d9-37a9-44cc-9147-85f875790622\\otp.log';

const EMAIL = 'admin_integrated_9@example.com';
const PASSWORD = 'AdminPassword123';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runTest = async () => {
    try {
        console.log('--- STARTING INTEGRATION TEST ---');

        // 1. Register
        console.log('1. Registering admin...');
        await axios.post(`${API_URL}/register`, {
            fullName: 'Admin Integrated',
            email: EMAIL,
            password: PASSWORD,
            role: 'admin' // Note: Register might default to 'user'. We need 'admin'.
            // If register doesn't accept role, we need another way.
            // My inMemoryDB implementation of register uses whatever is passed? 
            // Let's check auth.controller.js. 
            // Usually register defaults to 'user'. 
            // Check auth.controller.js: const user = db.users.create({ ...req.body, password: hashedPassword });
            // So if I pass role, it stays?
            // Let's hope so. If not, I can't create admin.
        });
        console.log('   Registration request sent.');

        // 2. Get OTP
        console.log('2. Waiting for OTP...');
        await sleep(2000); // Wait for file write
        const logs = fs.readFileSync(LOG_FILE, 'utf8');
        // Find the last OTP for this email
        const regex = new RegExp(`To: ${EMAIL}[\\s\\S]*?Your OTP is (\\d{6})`);
        const match = logs.match(regex);
        let otp = null;

        // Match might return multiple, we want the last one? 
        // actually logs.match with global flag? No, regex without global returns first match.
        // We need the *last* match.
        const allMatches = [...logs.matchAll(new RegExp(`To: ${EMAIL}[\\s\\S]*?Your OTP is (\\d{6})`, 'g'))];
        if (allMatches.length > 0) {
            otp = allMatches[allMatches.length - 1][1];
            console.log(`   OTP Found: ${otp}`);
        } else {
            throw new Error('OTP not found in logs');
        }

        // 3. Verify
        console.log('3. Verifying email...');
        await axios.post(`${API_URL}/verify-email`, { email: EMAIL, otp });
        console.log('   Verification successful.');

        // 4. Login
        console.log('4. Logging in...');
        const loginRes = await axios.post(`${API_URL}/login`, { email: EMAIL, password: PASSWORD });
        const token = loginRes.data.token;
        const user = loginRes.data.user;
        console.log(`   Login successful. Role: ${user.role}`);
        const headers = { Authorization: `Bearer ${token}` };

        if (user.role !== 'admin') {
            console.warn('   WARNING: User is NOT admin. Slot creation might fail if protected.');
            // If I can't be admin via register, I might need to hack the DB or use the backdoor I didn't add.
            // Let's try creating a slot anyway.
        }

        // 5. Create Slot
        console.log('5. Creating meeting slot...');
        const slotData = {
            title: 'Integration Test Meeting',
            description: 'Automated test',
            date: '2025-12-31',
            startTime: '10:00',
            endTime: '11:00',
            maxParticipants: 5
        };
        const slotRes = await axios.post(SLOT_API_URL, slotData, { headers });
        console.log('   Slot Created:', slotRes.data.slot.id);
        const slotId = slotRes.data.slot.id;

        // 6. User Login/Register (to book)
        // Let's just use the same user to book? 
        // "You have already booked this slot" check might fail if I am the creator?
        // No, bookings are by userId. Creator doesn't matter unless restricted.
        // But usually admins create, users book.
        // Let's just book as the same user for simplicity (if allowed).

        console.log('6. Booking the slot...');
        const bookRes = await axios.post(BOOKING_API_URL, { slotId }, { headers });
        console.log('   Booking successful:', bookRes.data.booking.id);
        const bookingId = bookRes.data.booking.id;

        // 7. Check My Bookings
        console.log('7. Checking my bookings...');
        const myBookingsRes = await axios.get(`${BOOKING_API_URL}/my-bookings`, { headers });
        const booking = myBookingsRes.data.bookings.find(b => b.id === bookingId);
        if (booking) {
            console.log('   Booking found in list.');
        } else {
            throw new Error('Booking not found in my-bookings');
        }

        // 8. Cancel Booking
        console.log('8. Cancelling booking...');
        await axios.delete(`${BOOKING_API_URL}/${bookingId}`, { headers });
        console.log('   Cancellation successful.');

        console.log('--- TEST COMPLETED SUCCESSFULLY ---');

    } catch (error) {
        console.error('TEST FAILED:', error.response?.data || error.message);
    }
};

runTest();
