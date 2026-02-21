import React, { useState, useEffect } from 'react';
import { getAllBookings, updateBookingStatus, getMeetingLink } from '../../../services/api';
import { toast } from 'react-toastify';
import { ExternalLink, ArrowRight } from 'lucide-react';

export default function BookedSlots() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const res = await getAllBookings();
            const confirmed = (res.data.bookings || []).filter(b => b.status === 'confirmed');
            setBookings(confirmed);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBookings(); }, []);

    const handleJoinMeeting = async (bookingId) => {
        try {
            const res = await getMeetingLink(bookingId);
            window.open(res.data.meetingLink, '_blank');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to get link');
        }
    };

    const handleMoveToJudgment = async (bookingId) => {
        try {
            await updateBookingStatus(bookingId, 'under_review');
            toast.success('Moved to Judgment Area');
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-bold text-white">Booked Slots</h1>
                <span className="text-sm text-zinc-500">{bookings.length} confirmed</span>
            </div>

            <div className="bg-[#111] border border-zinc-800/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                                <th className="px-5 py-4">Candidate</th>
                                <th className="px-5 py-4">Date & Time</th>
                                <th className="px-5 py-4">Resume</th>
                                <th className="px-5 py-4">Meeting</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(3)].map((_, i) => (
                                    <tr key={i} className="border-b border-zinc-800/30"><td colSpan="5" className="px-5 py-4"><div className="h-4 bg-zinc-800 rounded animate-pulse" /></td></tr>
                                ))
                            ) : bookings.length === 0 ? (
                                <tr><td colSpan="5" className="px-5 py-12 text-center text-zinc-500 text-sm">No confirmed bookings right now.</td></tr>
                            ) : (
                                bookings.map(b => (
                                    <tr key={b.id} className="border-b border-zinc-800/30 hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="text-sm font-medium text-white">{b.user?.fullName || 'Unknown'}</p>
                                            <p className="text-xs text-zinc-500">{b.user?.email}</p>
                                        </td>
                                        <td className="px-5 py-4 text-zinc-400 text-sm">
                                            {b.slot?.date} — {b.slot?.startTime}
                                        </td>
                                        <td className="px-5 py-4">
                                            {b.resumeUrl ? (
                                                <a href={`http://localhost:5000${b.resumeUrl}`} target="_blank" rel="noreferrer"
                                                    className="text-blue-400 hover:text-blue-300 text-sm">View PDF ↗</a>
                                            ) : <span className="text-zinc-600 text-sm">—</span>}
                                        </td>
                                        <td className="px-5 py-4">
                                            <button onClick={() => handleJoinMeeting(b.id)}
                                                className="flex items-center gap-1.5 text-sm text-emerald-400 hover:text-emerald-300 transition-colors">
                                                <ExternalLink className="w-3.5 h-3.5" /> Join
                                            </button>
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <button onClick={() => handleMoveToJudgment(b.id)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-amber-600/20 text-amber-400 border border-amber-700/30 hover:bg-amber-600/30 transition-colors">
                                                Move to Judgment <ArrowRight className="w-3.5 h-3.5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
