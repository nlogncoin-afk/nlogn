import React, { useState, useEffect } from 'react';
import { getAllBookings, updateBookingStatus, submitReport } from '../../../services/api';
import { toast } from 'react-toastify';
import { CheckCircle, XCircle, FileText, X } from 'lucide-react';

export default function JudgmentArea() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reportModal, setReportModal] = useState(null);
    const [reportForm, setReportForm] = useState({
        problemSolving: 5, dsaOptimization: 5, communication: 5,
        codeQuality: 5, coreSubjects: 5, interviewerComment: '',
        verdict: 'needs_improvement', overallRating: 5
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchBookings = async () => {
        try {
            const res = await getAllBookings();
            const underReview = (res.data.bookings || []).filter(b => b.status === 'under_review');
            setBookings(underReview);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const handleAppeared = (booking) => {
        setReportModal(booking);
        setReportForm({
            problemSolving: 5, dsaOptimization: 5, communication: 5,
            codeQuality: 5, coreSubjects: 5, interviewerComment: '',
            verdict: 'needs_improvement', overallRating: 5
        });
    };

    const handleNotAppeared = async (bookingId) => {
        if (!confirm('Mark as not attended?')) return;
        try {
            await updateBookingStatus(bookingId, 'not_attended');
            toast.success('Marked as not attended');
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        if (!reportModal) return;
        setSubmitting(true);
        try {
            // First mark as completed
            await updateBookingStatus(reportModal.id, 'completed');
            // Then submit report
            await submitReport(reportModal.id, reportForm);
            toast.success('Report submitted');
            setReportModal(null);
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit report');
        } finally {
            setSubmitting(false);
        }
    };

    const RatingSlider = ({ label, value, onChange }) => (
        <div>
            <div className="flex justify-between text-sm mb-1">
                <span className="text-zinc-400">{label}</span>
                <span className="text-white font-bold">{value}/10</span>
            </div>
            <input type="range" min="1" max="10" value={value} onChange={e => onChange(Number(e.target.value))}
                className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-bold text-white">Judgment Area</h1>
                <span className="text-sm text-zinc-500">{bookings.length} pending review</span>
            </div>

            {loading ? (
                <div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 h-28 animate-pulse" />)}</div>
            ) : bookings.length === 0 ? (
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-12 text-center">
                    <p className="text-zinc-500">No interviews pending judgment.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {bookings.map(b => (
                        <div key={b.id} className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <p className="text-white font-medium">{b.user?.fullName || 'Unknown'}</p>
                                <p className="text-sm text-zinc-500">{b.user?.email} • {b.slot?.date} at {b.slot?.startTime}</p>
                                {b.resumeUrl && (
                                    <a href={`http://localhost:5000${b.resumeUrl}`} target="_blank" rel="noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">View Resume ↗</a>
                                )}
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                <button onClick={() => handleAppeared(b)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-emerald-600/20 text-emerald-400 border border-emerald-700/30 hover:bg-emerald-600/30 transition-colors">
                                    <CheckCircle className="w-4 h-4" /> Appeared
                                </button>
                                <button onClick={() => handleNotAppeared(b.id)}
                                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600/20 text-red-400 border border-red-700/30 hover:bg-red-600/30 transition-colors">
                                    <XCircle className="w-4 h-4" /> Did Not Appear
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Report Modal */}
            {reportModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setReportModal(null)}>
                    <div className="bg-[#111] border border-zinc-800 rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-white">Submit Report</h3>
                                <p className="text-sm text-zinc-500">{reportModal.user?.fullName}</p>
                            </div>
                            <button onClick={() => setReportModal(null)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>

                        <form onSubmit={handleSubmitReport} className="space-y-5">
                            <RatingSlider label="Problem Solving" value={reportForm.problemSolving} onChange={v => setReportForm({ ...reportForm, problemSolving: v })} />
                            <RatingSlider label="DSA & Optimization" value={reportForm.dsaOptimization} onChange={v => setReportForm({ ...reportForm, dsaOptimization: v })} />
                            <RatingSlider label="Communication" value={reportForm.communication} onChange={v => setReportForm({ ...reportForm, communication: v })} />
                            <RatingSlider label="Code Quality" value={reportForm.codeQuality} onChange={v => setReportForm({ ...reportForm, codeQuality: v })} />
                            <RatingSlider label="Core Subjects" value={reportForm.coreSubjects} onChange={v => setReportForm({ ...reportForm, coreSubjects: v })} />

                            <div>
                                <label className="text-sm text-zinc-400 mb-1 block">Overall Rating</label>
                                <div className="flex items-center gap-3">
                                    <input type="range" min="1" max="10" value={reportForm.overallRating}
                                        onChange={e => setReportForm({ ...reportForm, overallRating: Number(e.target.value) })}
                                        className="flex-1 h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white" />
                                    <span className="text-xl font-bold text-white w-10 text-right">{reportForm.overallRating}</span>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-zinc-400 mb-1 block">Verdict</label>
                                <select value={reportForm.verdict} onChange={e => setReportForm({ ...reportForm, verdict: e.target.value })}
                                    className="w-full h-11 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-white text-sm outline-none focus:border-zinc-600">
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="needs_improvement">Needs Improvement</option>
                                    <option value="not_ready">Not Ready</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-zinc-400 mb-1 block">Interviewer Comments</label>
                                <textarea value={reportForm.interviewerComment}
                                    onChange={e => setReportForm({ ...reportForm, interviewerComment: e.target.value })}
                                    placeholder="Detailed feedback for the candidate..."
                                    className="w-full h-28 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-600 resize-none" />
                            </div>

                            <button type="submit" disabled={submitting}
                                className="w-full h-11 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
                                {submitting ? 'Submitting...' : 'Submit Report'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
