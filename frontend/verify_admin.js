import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';
const EMAIL = 'admin4@example.com';
const OTP = process.argv[2]; // Pass OTP as command line argument

const verifyAdmin = async () => {
    if (!OTP) {
        console.error('Please provide OTP as argument');
        process.exit(1);
    }

    try {
        console.log(`Verifying ${EMAIL} with OTP: ${OTP}`);
        const res = await axios.post(`${API_URL}/verify-email`, {
            email: EMAIL,
            otp: OTP
        });
        console.log('Verification Success:', res.data);
    } catch (error) {
        console.error('Verification Failed:', error.response?.data || error.message);
    }
};

verifyAdmin();
