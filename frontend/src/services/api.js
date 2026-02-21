import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('antilog_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRoute = error.config?.url?.includes('/auth/');

        if (error.response?.status === 401 && !isAuthRoute) {
            // Token expired or invalid — force logout
            localStorage.removeItem('antilog_token');
            localStorage.removeItem('antilog_user');
            delete api.defaults.headers.common['Authorization'];
            // Redirect to login
            window.location.href = '/login';
        }

        // Handle blocked user globally
        if (error.response?.status === 403 && error.response?.data?.message?.includes('blocked')) {
            localStorage.setItem('blocked', 'true');
            localStorage.setItem('blockedReason', error.response.data.reason || '');
            window.location.href = '/blocked';
        }
        return Promise.reject(error);
    }
);

// ==================== AUTH ====================
export const register = (userData) => api.post('/auth/register', userData);
export const verifyEmail = (data) => api.post('/auth/verify-email', data);
export const resendOTP = (data) => api.post('/auth/resend-otp', data);
export const login = (credentials) => api.post('/auth/login', credentials);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const verifyResetOTP = (data) => api.post('/auth/verify-reset-otp', data);
export const resetPassword = (data) => api.post('/auth/reset-password', data);

// ==================== MEETING SLOTS ====================
export const createBatchSlots = (data) => api.post('/meeting-slots/batch', data);
export const getAllSlots = () => api.get('/meeting-slots/admin/all');
export const getAvailableSlots = () => api.get('/meeting-slots/available');
export const updateSlot = (id, updates) => api.put(`/meeting-slots/${id}`, updates);
export const deleteSlot = (id) => api.delete(`/meeting-slots/${id}`);

// ==================== BOOKINGS ====================
export const createBooking = (formData) => api.post('/bookings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});
export const getMyBookings = () => api.get('/bookings/my-bookings');
export const getAllBookings = () => api.get('/bookings/admin/all');
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const cancelBooking = (id) => api.delete(`/bookings/${id}`);
export const updateBookingStatus = (id, status) => api.patch(`/bookings/${id}/status`, { status });
export const submitReport = (id, reportData) => api.post(`/bookings/${id}/report`, reportData);
export const getReport = (id) => api.get(`/bookings/${id}/report`);
export const getMeetingLink = (id) => api.get(`/bookings/${id}/meeting-link`);
export const updateResume = (id, formData) => api.patch(`/bookings/${id}/resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
});

// ==================== USERS (ADMIN) ====================
export const getAllUsers = () => api.get('/users/admin/all');
export const getUserProfile = (id) => api.get(`/users/admin/${id}`);
export const toggleBlockUser = (id, data) => api.patch(`/users/admin/${id}/block`, data);

// ==================== ANALYTICS (ADMIN) ====================
export const getAnalytics = () => api.get('/admin/analytics');

export default api;
