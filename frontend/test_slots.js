import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';
const SLOT_API_URL = 'http://localhost:5000/api/meeting-slots';
const EMAIL = 'admin4@example.com';
const PASSWORD = 'AdminPassword123';

const runTest = async () => {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/login`, { email: EMAIL, password: PASSWORD });
        console.log('Login Success. Token:', loginRes.data.token);
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Create Slot
        console.log('Creating slot...');
        const slotData = {
            title: 'Test Meeting',
            description: 'This is a test meeting',
            date: '2025-12-25',
            startTime: '10:00',
            endTime: '11:00',
            maxParticipants: 5
        };
        const slotRes = await axios.post(SLOT_API_URL, slotData, { headers });
        console.log('Slot Created:', slotRes.data);

        // 3. Get Available Slots (Public/User route but accessible)
        console.log('Fetching available slots...');
        const availRes = await axios.get(`${SLOT_API_URL}/available`, { headers });
        console.log('Available Slots:', availRes.data.slots.length);

    } catch (error) {
        console.error('Test Failed:', error.response?.data || error.message);
    }
};

runTest();
