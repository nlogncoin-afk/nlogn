import React, { useState, useEffect } from 'react';
import { getMyBookings } from '../../../services/api';
import { BookOpen, Star, ChevronDown, ChevronUp, Activity, TrendingUp } from 'lucide-react';
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function PreviousInterviews() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getMyBookings();
                // Filter completed bookings with reports, sort old to new for the line chart progression
                const completed = (res.data.bookings || [])
                    .filter(b => b.status === 'completed' && b.report)
                    .sort((a, b) => new Date(`${a.slot?.date}T${a.slot?.startTime}`) - new Date(`${b.slot?.date}T${b.slot?.startTime}`));
                setBookings(completed);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const verdictColor = {
        excellent: 'text-emerald-400 bg-emerald-950/50 border-emerald-900/50',
        good: 'text-blue-400 bg-blue-950/50 border-blue-900/50',
        needs_improvement: 'text-amber-400 bg-amber-950/50 border-amber-900/50',
        not_ready: 'text-red-400 bg-red-950/50 border-red-900/50'
    };

    const RatingBar = ({ label, value }) => (
        <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-400 w-40 shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${(value / 10) * 100}%` }} />
            </div>
            <span className="text-sm text-white font-bold w-8 text-right">{value}</span>
        </div>
    );

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-[#111] border border-zinc-800 px-4 py-3 rounded-xl shadow-xl">
                    <p className="text-zinc-500 font-medium text-xs mb-2 uppercase tracking-wider">{payload[0].payload.date}</p>
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Overall Rating: {payload[0].value}/10
                    </p>
                </div>
            );
        }
        return null;
    };

    const recentBookings = bookings.slice(-5);
    const calculateAverage = (field) => {
        if (recentBookings.length === 0) return 0;
        const sum = recentBookings.reduce((acc, curr) => acc + (curr.report?.[field] || 0), 0);
        return parseFloat((sum / recentBookings.length).toFixed(1));
    };

    const radarData = bookings.length > 0 ? [
        { subject: 'Problem Solving', score: calculateAverage('problemSolving'), fullMark: 10 },
        { subject: 'DSA & Algo', score: calculateAverage('dsaOptimization'), fullMark: 10 },
        { subject: 'Communication', score: calculateAverage('communication'), fullMark: 10 },
        { subject: 'Code Quality', score: calculateAverage('codeQuality'), fullMark: 10 },
        { subject: 'Core Subjects', score: calculateAverage('coreSubjects'), fullMark: 10 },
    ] : [];

    const lineData = bookings.map((b, index) => ({
        name: `Int #${index + 1}`,
        date: b.slot?.date || 'Unknown',
        score: b.report?.overallRating || 0
    }));

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-display font-bold text-white">Analytics Hub</h1>
                <p className="text-zinc-500 text-sm mt-1">Track your interview performance and skill progression.</p>
            </div>

            {loading ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 h-32 animate-pulse" />)}</div>
            ) : bookings.length === 0 ? (
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                    <div className="p-4 bg-zinc-900/50 rounded-full mb-4">
                        <Activity className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h3 className="text-lg font-medium text-white mb-1">No Data Available</h3>
                    <p className="text-zinc-500 text-sm max-w-sm">
                        You need to complete at least one mock interview to unlock your analytics and see your skill profile.
                    </p>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-6"
                >
                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Radar Chart Card */}
                        <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 flex flex-col relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-[80px] -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-60 pointer-events-none"></div>
                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                <Activity className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">Current Skill Profile</h3>
                            </div>
                            <p className="text-xs text-zinc-500 mb-6 relative z-10">Based on your {Math.min(bookings.length, 5)} most recent interviews.</p>

                            <div className="flex-1 w-full min-h-[260px] flex items-center justify-center -ml-2 relative z-10">
                                <ResponsiveContainer width="100%" height={260}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                        <PolarGrid stroke="#27272a" strokeDasharray="3 3" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11, fontWeight: 500 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} />
                                        <Radar
                                            name="Score"
                                            dataKey="score"
                                            stroke="#10b981"
                                            strokeWidth={2}
                                            fill="#10b981"
                                            fillOpacity={0.25}
                                        />
                                        <RechartsTooltip
                                            contentStyle={{ backgroundColor: '#111', borderColor: '#27272a', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                                            itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Line Chart Card */}
                        <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 flex flex-col relative overflow-hidden group">
                            <div className="absolute bottom-0 right-0 p-32 bg-blue-500/5 rounded-full blur-[80px] -mr-16 -mb-16 transition-opacity group-hover:opacity-100 opacity-60 pointer-events-none"></div>
                            <div className="flex items-center gap-2 mb-2 relative z-10">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wider">Performance Trajectory</h3>
                            </div>
                            <p className="text-xs text-zinc-500 mb-6 relative z-10">Overall rating progression over time.</p>

                            <div className="flex-1 w-full min-h-[260px] flex items-end -ml-4 relative z-10">
                                <ResponsiveContainer width="100%" height={260}>
                                    <LineChart data={lineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#52525b"
                                            tick={{ fill: '#a1a1aa', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            domain={[0, 10]}
                                            stroke="#52525b"
                                            tick={{ fill: '#a1a1aa', fontSize: 11 }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickCount={6}
                                            dx={-10}
                                        />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                                        <Line
                                            type="monotone"
                                            dataKey="score"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#111', stroke: '#3b82f6', strokeWidth: 2 }}
                                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#111', strokeWidth: 2 }}
                                            animationDuration={1500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Interview History Log */}
                    <div className="mt-8 pt-8 border-t border-zinc-800/50">
                        <div className="flex items-center gap-2 mb-6">
                            <BookOpen className="w-5 h-5 text-zinc-400" />
                            <h3 className="text-lg font-medium text-white">Detailed Report Log</h3>
                        </div>

                        <div className="space-y-3 relative">
                            {/* Reverse so the newest is list first in the log! */}
                            {[...bookings].reverse().map((b, i) => (
                                <div key={b.id} className="bg-[#111] border border-zinc-800/50 rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-700/50">
                                    <div
                                        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/30 transition-colors"
                                        onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                                    >
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="hidden sm:flex w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 items-center justify-center font-mono text-xs text-zinc-500 font-bold">
                                                #{bookings.length - i}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-white">{b.slot?.date || 'Unknown'}</p>
                                                <p className="text-xs text-zinc-500">{b.slot?.startTime} – {b.slot?.endTime}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-end gap-3 sm:gap-4 flex-1">
                                            {b.report ? (
                                                <>
                                                    <span className={`px-2.5 py-1 rounded-full text-[10px] sm:text-xs capitalize border ${verdictColor[b.report.verdict] || 'text-zinc-400 border-zinc-800 bg-zinc-900'}`}>
                                                        {b.report.verdict?.replace(/_/g, ' ') || 'Unknown'}
                                                    </span>
                                                    <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
                                                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                        <span className="text-sm font-bold text-white leading-none">{b.report.overallRating}</span>
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-xs text-zinc-500">Pending</span>
                                            )}
                                            <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                                                {expanded === b.id ? <ChevronUp className="w-3.5 h-3.5 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />}
                                            </div>
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {expanded === b.id && b.report && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-5 pb-5 border-t border-zinc-800/50 pt-6">
                                                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                                        {/* Feature 1: The specific interview radar chart (Span 4) */}
                                                        <div className="lg:col-span-4 bg-black/20 border border-zinc-800/30 rounded-xl p-4 flex flex-col relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 p-24 bg-purple-500/5 rounded-full blur-[60px] -mr-12 -mt-12 transition-opacity group-hover:opacity-100 opacity-60 pointer-events-none"></div>
                                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 relative z-10">Session Snapshot</p>
                                                            <div className="flex-1 w-full min-h-[180px] flex items-center justify-center -ml-2 relative z-10">
                                                                <ResponsiveContainer width="100%" height={180}>
                                                                    <RadarChart cx="50%" cy="50%" outerRadius="65%" data={[
                                                                        { subject: 'Problem Solving', score: b.report.problemSolving, fullMark: 10 },
                                                                        { subject: 'DSA & Algo', score: b.report.dsaOptimization, fullMark: 10 },
                                                                        { subject: 'Communication', score: b.report.communication, fullMark: 10 },
                                                                        { subject: 'Code Quality', score: b.report.codeQuality, fullMark: 10 },
                                                                        { subject: 'Core Subjects', score: b.report.coreSubjects, fullMark: 10 }
                                                                    ]}>
                                                                        <PolarGrid stroke="#27272a" strokeDasharray="3 3" />
                                                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 9, fontWeight: 500 }} />
                                                                        <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                                                                        <Radar
                                                                            name="Score"
                                                                            dataKey="score"
                                                                            stroke="#a855f7"
                                                                            strokeWidth={2}
                                                                            fill="#a855f7"
                                                                            fillOpacity={0.25}
                                                                        />
                                                                        <RechartsTooltip
                                                                            contentStyle={{ backgroundColor: '#111', borderColor: '#27272a', borderRadius: '12px', padding: '8px 12px' }}
                                                                            itemStyle={{ color: '#a855f7', fontWeight: 'bold', fontSize: '12px' }}
                                                                        />
                                                                    </RadarChart>
                                                                </ResponsiveContainer>
                                                            </div>
                                                        </div>

                                                        {/* Feature 2: The granular scores breakdown (Span 4) */}
                                                        <div className="lg:col-span-4 bg-black/20 border border-zinc-800/30 rounded-xl p-5 flex flex-col justify-center space-y-4">
                                                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Score Breakdown</p>
                                                            <RatingBar label="Problem Solving" value={b.report.problemSolving} />
                                                            <RatingBar label="DSA & Optimization" value={b.report.dsaOptimization} />
                                                            <RatingBar label="Communication" value={b.report.communication} />
                                                            <RatingBar label="Code Quality" value={b.report.codeQuality} />
                                                            <RatingBar label="Core Subjects" value={b.report.coreSubjects} />
                                                        </div>

                                                        {/* Feature 3: The written feedback (Span 4) */}
                                                        <div className="lg:col-span-4 bg-black/20 border border-zinc-800/30 rounded-xl p-5 flex flex-col">
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Interviewer Feedback</p>
                                                            </div>
                                                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                                                <p className="text-sm text-zinc-300 leading-relaxed font-serif italic text-lg">
                                                                    "{b.report.interviewerComment || "No specific feedback provided for this session."}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
