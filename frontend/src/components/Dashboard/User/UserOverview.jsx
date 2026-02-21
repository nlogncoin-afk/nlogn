import React, { useState, useEffect } from 'react';
import { getMyBookings } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Calendar, CheckCircle, Clock, XCircle, Star } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{title}</p>
            <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        </div>
    </div>
);

export default function UserOverview() {
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

    const confirmed = bookings.filter(b => b.status === 'confirmed');
    const completed = bookings.filter(b => b.status === 'completed');
    const notAttended = bookings.filter(b => b.status === 'not_attended');

    // Next upcoming interview
    const nextInterview = confirmed
        .filter(b => {
            if (!b.slot) return false;
            const slotStart = new Date(`${b.slot.date}T${b.slot.startTime}:00`);
            return slotStart > new Date();
        })
        .sort((a, b) => {
            const aTime = new Date(`${a.slot.date}T${a.slot.startTime}:00`);
            const bTime = new Date(`${b.slot.date}T${b.slot.startTime}:00`);
            return aTime - bTime;
        })[0];

    // Average rating from reports
    const avgRating = completed.length > 0
        ? (completed.reduce((sum, b) => sum + (b.report?.overallRating || 0), 0) / completed.filter(b => b.report).length).toFixed(1)
        : '—';

    // Countdown
    const [countdown, setCountdown] = useState('');

    useEffect(() => {
        if (!nextInterview?.slot) return;
        const interval = setInterval(() => {
            const slotStart = new Date(`${nextInterview.slot.date}T${nextInterview.slot.startTime}:00`);
            const diff = slotStart - new Date();
            if (diff <= 0) {
                setCountdown('Starting now!');
                return;
            }
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((diff / (1000 * 60)) % 60);
            const seconds = Math.floor((diff / 1000) % 60);
            setCountdown(`${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [nextInterview]);

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-display font-bold text-white">Welcome back</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <div key={i} className="bg-[#111] border border-zinc-800/50 rounded-xl p-5 h-24 animate-pulse" />)}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-display font-bold text-white">Welcome back, {user?.fullName?.split(' ')[0] || 'User'}</h1>
                <p className="text-zinc-500 text-sm mt-1">Here's your interview overview.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Bookings" value={bookings.length} icon={Calendar} color="bg-blue-600" />
                <StatCard title="Completed" value={completed.length} icon={CheckCircle} color="bg-emerald-600" />
                <StatCard title="Upcoming" value={confirmed.length} icon={Clock} color="bg-purple-600" />
                <StatCard title="Avg Rating" value={avgRating} icon={Star} color="bg-amber-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Next Interview Card */}
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-zinc-400 mb-4">Next Interview</h3>
                    {nextInterview ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-lg font-bold text-white">{nextInterview.slot.date}</p>
                                    <p className="text-zinc-400">{nextInterview.slot.startTime} – {nextInterview.slot.endTime}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-zinc-500">Starts in</p>
                                    <p className="text-lg font-bold font-mono text-white">{countdown}</p>
                                </div>
                            </div>
                            <div className="h-px bg-zinc-800" />
                            <p className="text-xs text-zinc-500">Meeting link will be available 5 minutes before the interview.</p>
                        </div>
                    ) : (
                        <p className="text-zinc-600 text-sm">No upcoming interviews. Book one to get started!</p>
                    )}
                </div>

                {/* Latest Report */}
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-zinc-400 mb-4">Latest Report</h3>
                    {completed.length > 0 && completed[0].report ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400">{completed[0].slot?.date}</span>
                                <span className={`px-2.5 py-1 rounded-full text-xs capitalize border ${completed[0].report.verdict === 'excellent' ? 'text-emerald-400 bg-emerald-950/50 border-emerald-900/50' :
                                        completed[0].report.verdict === 'good' ? 'text-blue-400 bg-blue-950/50 border-blue-900/50' :
                                            completed[0].report.verdict === 'needs_improvement' ? 'text-amber-400 bg-amber-950/50 border-amber-900/50' :
                                                'text-red-400 bg-red-950/50 border-red-900/50'
                                    }`}>{completed[0].report.verdict?.replace('_', ' ')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                <span className="text-2xl font-bold text-white">{completed[0].report.overallRating}/10</span>
                            </div>
                            {completed[0].report.interviewerComment && (
                                <p className="text-sm text-zinc-400 line-clamp-3">"{completed[0].report.interviewerComment}"</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-zinc-600 text-sm">No reports yet. Complete an interview to see feedback.</p>
                    )}
                </div>
            </div>

            {/* Not Attended Warning */}
            {notAttended.length > 0 && (
                <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4 flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <p className="text-sm text-red-300">
                        You have {notAttended.length} interview{notAttended.length > 1 ? 's' : ''} marked as not attended. Repeated no-shows may lead to account restrictions.
                    </p>
                </div>
            )}
        </div>
    );
}
