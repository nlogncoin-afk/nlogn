import React, { useState, useEffect } from 'react';
import { getMyBookings } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Calendar, CheckCircle, Clock, XCircle, Star, TrendingUp, Activity } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-5 flex items-center gap-4 relative overflow-hidden group">
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity ${color.replace('text-', 'bg-').replace('bg-', 'bg-')}`}></div>
        <div className={`p-3 rounded-xl flex items-center justify-center ${color.replace('text-', 'bg-').replace('bg-', 'bg-').replace('600', '900/30')} border border-zinc-800/50`}>
            <Icon className={`w-5 h-5 ${color.includes('bg-') ? 'text-white' : color}`} />
        </div>
        <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">{title}</p>
            <div className="flex items-center gap-2 mt-0.5">
                <p className="text-2xl font-bold text-white">{value}</p>
                {trend && (
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded flex items-center">
                        <TrendingUp className="w-3 h-3 mr-0.5" />
                        {trend}
                    </span>
                )}
            </div>
        </div>
    </div>
);

// Circular Progress Component for Latest Report
const CircularProgress = ({ value, max, size = 72, strokeWidth = 6, color = "text-emerald-400", trackColor = "text-zinc-800" }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90 w-full h-full">
                <circle
                    className={`${trackColor} stroke-current w-full h-full`}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    className={`${color} stroke-current w-full h-full drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 1.5s ease-in-out' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-white font-bold text-xl">{value}</span>
            </div>
        </div>
    );
};

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
    // Sort completed to show the most recent first
    const completed = bookings.filter(b => b.status === 'completed').sort((a, b) => new Date(`${b.slot?.date}T${b.slot?.startTime}`) - new Date(`${a.slot?.date}T${a.slot?.startTime}`));
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
                <p className="text-zinc-500 text-sm mt-1">Here is your comprehensive interview overview.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Bookings" value={bookings.length} icon={Calendar} color="text-blue-400" />
                <StatCard title="Completed" value={completed.length} icon={CheckCircle} color="text-emerald-400" trend={completed.length > 0 ? '+1' : null} />
                <StatCard title="Upcoming" value={confirmed.length} icon={Clock} color="text-purple-400" />
                <StatCard title="Avg Rating" value={avgRating} icon={Star} color="text-amber-400" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Next Interview Card */}
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 relative overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-32 bg-purple-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex items-center gap-2 mb-6 relative z-10">
                        <Clock className="w-5 h-5 text-purple-400" />
                        <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Next Interview</h3>
                    </div>

                    {nextInterview ? (
                        <div className="space-y-5 flex-1 flex flex-col justify-between relative z-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xl font-bold text-white mb-1">{nextInterview.slot.date}</p>
                                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div>
                                        {nextInterview.slot.startTime} – {nextInterview.slot.endTime}
                                    </div>
                                </div>
                                <div className="text-right bg-zinc-900/50 border border-zinc-800/50 rounded-lg py-2 px-4 flex flex-col items-end">
                                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Starts in</p>
                                    <p className="text-lg font-bold font-mono text-white tracking-tight">{countdown}</p>
                                </div>
                            </div>
                            <div className="h-px bg-zinc-800/50 w-full" />
                            <div className="bg-purple-950/20 border border-purple-900/30 rounded-lg p-3 text-center">
                                <p className="text-xs text-purple-300 font-medium">Meeting link will be available in your Upcoming tab 5 minutes before start.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center py-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mb-3 border border-zinc-800">
                                <Calendar className="w-5 h-5 text-zinc-500" />
                            </div>
                            <p className="text-zinc-400 text-sm mb-1">No upcoming interviews.</p>
                            <p className="text-zinc-600 text-xs">Book a slot to keep practicing!</p>
                        </div>
                    )}
                </div>

                {/* Latest Report */}
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 relative overflow-hidden flex flex-col group hover:border-zinc-700/50 transition-colors">
                    <div className="absolute top-0 right-0 p-32 bg-amber-500/5 rounded-full blur-[80px] -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-6 relative z-10">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-amber-400" />
                            <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Latest Performance</h3>
                        </div>
                        {completed.length > 0 && completed[0].report && (
                            <span className="text-xs text-zinc-500 font-mono">{completed[0].slot?.date}</span>
                        )}
                    </div>

                    {completed.length > 0 && completed[0].report ? (
                        <div className="flex-1 flex flex-col relative z-10">
                            <div className="flex items-center gap-6 mb-5 pt-2">
                                <CircularProgress
                                    value={completed[0].report.overallRating}
                                    max={10}
                                    size={76}
                                    color={
                                        completed[0].report.overallRating >= 8 ? "text-emerald-400" :
                                            completed[0].report.overallRating >= 6 ? "text-blue-400" :
                                                completed[0].report.overallRating >= 4 ? "text-amber-400" : "text-red-400"
                                    }
                                />
                                <div>
                                    <span className={`px-3 py-1.5 rounded-full text-xs uppercase tracking-widest font-bold border ${(completed[0].report.verdict === 'excellent' || completed[0].report.verdict === 'strong_hire') ? 'text-emerald-400 bg-emerald-950/30 border-emerald-900/50' :
                                            (completed[0].report.verdict === 'good' || completed[0].report.verdict === 'hire') ? 'text-blue-400 bg-blue-950/30 border-blue-900/50' :
                                                (completed[0].report.verdict === 'needs_improvement' || completed[0].report.verdict === 'lean_no_hire') ? 'text-amber-400 bg-amber-950/30 border-amber-900/50' :
                                                    'text-red-400 bg-red-950/30 border-red-900/50'
                                        }`}>
                                        {completed[0].report.verdict?.replace(/_/g, ' ')}
                                    </span>
                                    <p className="text-zinc-500 text-xs mt-3 flex items-center gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5" /> Core skills evaluated
                                    </p>
                                </div>
                            </div>

                            <div className="bg-black/30 border border-zinc-800/50 rounded-xl p-4 mt-auto">
                                <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Interviewer Note</p>
                                <p className="text-sm text-zinc-300 line-clamp-2 italic tracking-wide">
                                    "{completed[0].report.interviewerComment || "No specific comments for this round."}"
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center py-4">
                            <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center mb-3 border border-zinc-800">
                                <Star className="w-5 h-5 text-zinc-500" />
                            </div>
                            <p className="text-zinc-400 text-sm mb-1">No reports yet.</p>
                            <p className="text-zinc-600 text-xs">Complete an interview to see feedback.</p>
                        </div>
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
