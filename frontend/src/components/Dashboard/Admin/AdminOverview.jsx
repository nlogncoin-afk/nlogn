import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../../../services/api';
import { Users, Calendar, CheckCircle, Clock, TrendingUp, XCircle } from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';

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

const PIE_COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#eab308'];

export default function AdminOverview() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getAnalytics();
                setData(res.data);
            } catch (err) {
                console.error('Failed to fetch analytics', err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-display font-bold text-white">Overview</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-[#111] border border-zinc-800/50 rounded-xl p-5 h-24 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!data) return <p className="text-zinc-500">Failed to load analytics.</p>;

    const { stats, charts, upcomingBookings } = data;

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-display font-bold text-white">Admin Overview</h1>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-600" />
                <StatCard title="Total Bookings" value={stats.totalBookings} icon={Calendar} color="bg-purple-600" />
                <StatCard title="Today" value={stats.interviewsToday} icon={Clock} color="bg-amber-600" />
                <StatCard title="Upcoming" value={stats.upcomingConfirmed} icon={TrendingUp} color="bg-emerald-600" />
                <StatCard title="Completion" value={`${stats.completionRate}%`} icon={CheckCircle} color="bg-green-600" />
                <StatCard title="No-Show" value={`${stats.cancellationRate}%`} icon={XCircle} color="bg-red-600" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Line Chart — 30 day bookings */}
                <div className="lg:col-span-2 bg-[#111] border border-zinc-800/50 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-zinc-400 mb-4">Bookings — Last 30 Days</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={charts.last30Days}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} tickFormatter={v => v.slice(5)} />
                            <YAxis tick={{ fontSize: 10, fill: '#71717a' }} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8 }} />
                            <Line type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart — Status distribution */}
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-zinc-400 mb-4">Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={charts.statusDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                                {charts.statusDistribution.map((_, i) => (
                                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 mt-2 justify-center">
                        {charts.statusDistribution.map((item, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-xs text-zinc-400">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }} />
                                {item.name} ({item.value})
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bar Chart — This Week + Upcoming Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-zinc-400 mb-4">Interviews This Week</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={charts.thisWeek}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f1f" />
                            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#71717a' }} />
                            <YAxis tick={{ fontSize: 11, fill: '#71717a' }} allowDecimals={false} />
                            <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #27272a', borderRadius: 8 }} />
                            <Bar dataKey="interviews" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Upcoming Interviews Widget */}
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6">
                    <h3 className="text-sm font-medium text-zinc-400 mb-4">Upcoming Confirmed</h3>
                    {upcomingBookings.length === 0 ? (
                        <p className="text-zinc-600 text-sm">No upcoming interviews.</p>
                    ) : (
                        <div className="space-y-3">
                            {upcomingBookings.map((b, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-zinc-800/50 last:border-0">
                                    <div>
                                        <p className="text-sm font-medium text-white">{b.userName}</p>
                                        <p className="text-xs text-zinc-500">{b.slotDate} at {b.slotTime}</p>
                                    </div>
                                    {b.resumeUrl && (
                                        <a href={`http://localhost:5000${b.resumeUrl}`} target="_blank" rel="noreferrer"
                                            className="text-xs text-blue-400 hover:text-blue-300">
                                            Resume ↗
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
