import React, { useState, useEffect } from 'react';
import { getMyBookings, getReport } from '../../../services/api';
import { BookOpen, Star, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function PreviousInterviews() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getMyBookings();
                const completed = (res.data.bookings || []).filter(b => b.status === 'completed');
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
            <span className="text-sm text-zinc-400 w-36 shrink-0">{label}</span>
            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${(value / 10) * 100}%` }} />
            </div>
            <span className="text-sm text-white font-bold w-8 text-right">{value}</span>
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-white">Previous Interviews</h1>

            {loading ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 h-24 animate-pulse" />)}</div>
            ) : bookings.length === 0 ? (
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-12 text-center">
                    <BookOpen className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">No completed interviews yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {bookings.map(b => (
                        <div key={b.id} className="bg-[#111] border border-zinc-800/50 rounded-xl overflow-hidden">
                            <div
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-900/30 transition-colors"
                                onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                            >
                                <div className="flex items-center gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-white">{b.slot?.date || 'Unknown'}</p>
                                        <p className="text-xs text-zinc-500">{b.slot?.startTime} – {b.slot?.endTime}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {b.report ? (
                                        <>
                                            <span className={`px-2.5 py-1 rounded-full text-xs capitalize border ${verdictColor[b.report.verdict] || 'text-zinc-400'}`}>
                                                {b.report.verdict?.replace('_', ' ')}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                                <span className="text-sm font-bold text-white">{b.report.overallRating}</span>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-xs text-zinc-500">Report pending</span>
                                    )}
                                    {expanded === b.id ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                                </div>
                            </div>

                            {expanded === b.id && b.report && (
                                <div className="px-5 pb-5 border-t border-zinc-800/50 pt-4 space-y-4">
                                    <div className="space-y-3">
                                        <RatingBar label="Problem Solving" value={b.report.problemSolving} />
                                        <RatingBar label="DSA & Optimization" value={b.report.dsaOptimization} />
                                        <RatingBar label="Communication" value={b.report.communication} />
                                        <RatingBar label="Code Quality" value={b.report.codeQuality} />
                                        <RatingBar label="Core Subjects" value={b.report.coreSubjects} />
                                    </div>
                                    {b.report.interviewerComment && (
                                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-4">
                                            <p className="text-xs text-zinc-500 mb-1">Interviewer Feedback</p>
                                            <p className="text-sm text-zinc-300">{b.report.interviewerComment}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
