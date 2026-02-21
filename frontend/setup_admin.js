import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

const setupAdmin = async () => {
    try {
        console.log('Registering admin user...');
        const regRes = await axios.post(`${API_URL}/register`, {
            fullName: 'Admin User 4',
            email: 'admin4@example.com',
            password: 'AdminPassword123',
        });
        console.log('Admin Registered:', regRes.data);
    } catch (error) {
        if (error.response) {
            console.error('Setup Error Status:', error.response.status);
            console.error('Setup Error Data:', error.response.data);
        } else if (error.request) {
            console.error('Setup Error Request: No response received');
        } else {
            console.error('Setup Error Message:', error.message);
        }
    }
};

setupAdmin();
