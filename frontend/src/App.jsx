import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BlockedPage from './pages/BlockedPage';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import VerifyEmail from './components/Auth/VerifyEmail';
import ForgotPassword from './components/Auth/ForgotPassword';
import VerifyResetOTP from './components/Auth/VerifyResetOTP';
import ResetPassword from './components/Auth/ResetPassword';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import UserDashboard from './components/Dashboard/UserDashboard';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FullScreenLoader from './components/ui/FullScreenLoader';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (user?.isBlocked || localStorage.getItem('blocked') === 'true') {
        return <Navigate to="/blocked" replace />;
    }

    if (adminOnly && user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

const PublicOnlyRoute = ({ children }) => {
    const { isAuthenticated, user } = useAuth();

    if (isAuthenticated) {
        if (user?.role === 'admin') {
            return <Navigate to="/admin" replace />;
        }
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    const { isLoading } = useAuth();

    if (isLoading) {
        return <FullScreenLoader />;
    }

    return (
        <>
            <Routes>
                {/* Public-only routes — logged in users get redirected to dashboard */}
                <Route path="/" element={<PublicOnlyRoute><LandingPage /></PublicOnlyRoute>} />
                <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
                <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
                <Route path="/verify-email" element={<PublicOnlyRoute><VerifyEmail /></PublicOnlyRoute>} />
                <Route path="/forgot-password" element={<PublicOnlyRoute><ForgotPassword /></PublicOnlyRoute>} />
                <Route path="/verify-reset-otp" element={<PublicOnlyRoute><VerifyResetOTP /></PublicOnlyRoute>} />
                <Route path="/reset-password" element={<PublicOnlyRoute><ResetPassword /></PublicOnlyRoute>} />

                {/* Blocked page — accessible to anyone */}
                <Route path="/blocked" element={<BlockedPage />} />

                {/* User dashboard routes */}
                <Route path="/dashboard/*" element={
                    <ProtectedRoute>
                        <UserDashboard />
                    </ProtectedRoute>
                } />

                {/* Admin dashboard routes */}
                <Route path="/admin/*" element={
                    <ProtectedRoute adminOnly={true}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
        </>
    );
}

export default App;
