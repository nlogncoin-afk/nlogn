import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BlockedPage() {
    const reason = localStorage.getItem('blockedReason') || '';
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('blocked');
        localStorage.removeItem('blockedReason');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-red-950/30 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                </div>
                <h1 className="text-3xl font-display font-bold text-white">Account Blocked</h1>
                <p className="text-zinc-400 text-lg">
                    Your account has been blocked by an administrator.
                </p>
                {reason && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                        <p className="text-sm text-zinc-500 mb-1">Reason:</p>
                        <p className="text-white">{reason}</p>
                    </div>
                )}
                <p className="text-zinc-500 text-sm">
                    Please contact support if you believe this is a mistake.
                </p>
                <button
                    onClick={handleLogout}
                    className="inline-flex items-center justify-center rounded-lg font-medium px-6 h-11 bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 transition-colors"
                >
                    Return to Login
                </button>
            </div>
        </div>
    );
}
