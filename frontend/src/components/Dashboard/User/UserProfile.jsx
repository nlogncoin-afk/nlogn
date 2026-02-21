import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { getMyBookings } from '../../../services/api';
import { User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function UserProfile() {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getMyBookings();
                setBookings(res.data.bookings || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const totalBookings = bookings.length;
    const completedCount = bookings.filter(b => b.status === 'completed').length;
    const upcomingCount = bookings.filter(b => b.status === 'confirmed').length;
    const notAttendedCount = bookings.filter(b => b.status === 'not_attended').length;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-white">Profile</h1>

            {/* Profile Card */}
            <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-white">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white">{user?.fullName}</h2>
                        <p className="text-zinc-500">{user?.email}</p>
                        <p className="text-xs text-zinc-600 mt-1">Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-5">
                    <Calendar className="w-5 h-5 text-blue-400 mb-3" />
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Interviews</p>
                    <p className="text-2xl font-bold text-white mt-1">{loading ? '...' : totalBookings}</p>
                </div>
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-5">
                    <CheckCircle className="w-5 h-5 text-emerald-400 mb-3" />
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Completed</p>
                    <p className="text-2xl font-bold text-white mt-1">{loading ? '...' : completedCount}</p>
                </div>
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-5">
                    <Clock className="w-5 h-5 text-purple-400 mb-3" />
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Upcoming</p>
                    <p className="text-2xl font-bold text-white mt-1">{loading ? '...' : upcomingCount}</p>
                </div>
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-5">
                    <XCircle className="w-5 h-5 text-red-400 mb-3" />
                    <p className="text-xs text-zinc-500 uppercase tracking-wider">Not Attended</p>
                    <p className="text-2xl font-bold text-white mt-1">{loading ? '...' : notAttendedCount}</p>
                </div>
            </div>

            {/* Info */}
            <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-medium text-zinc-400">Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-zinc-500 mb-1">Full Name</p>
                        <p className="text-white">{user?.fullName}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 mb-1">Email</p>
                        <p className="text-white">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 mb-1">Role</p>
                        <p className="text-white capitalize">{user?.role}</p>
                    </div>
                    <div>
                        <p className="text-xs text-zinc-500 mb-1">Account Status</p>
                        <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-900/50">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
