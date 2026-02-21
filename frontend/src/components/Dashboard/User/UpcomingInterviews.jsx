import React, { useState, useEffect, useRef } from 'react';
import { getMyBookings, getMeetingLink, updateResume } from '../../../services/api';
import { toast } from 'react-toastify';
import { ExternalLink, Clock, FileText, Upload } from 'lucide-react';

function CountdownTimer({ targetDate }) {
    const [text, setText] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = new Date(targetDate) - new Date();
            if (diff <= 0) { setText('Starting now!'); return; }
            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff / 3600000) % 24);
            const m = Math.floor((diff / 60000) % 60);
            const s = Math.floor((diff / 1000) % 60);
            setText(`${d > 0 ? d + 'd ' : ''}${h}h ${m}m ${s}s`);
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate]);

    return <span className="font-mono text-white font-bold">{text}</span>;
}

export default function UpcomingInterviews() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const fileRefs = useRef({});

    const fetchBookings = async () => {
        try {
            const res = await getMyBookings();
            const confirmed = (res.data.bookings || []).filter(b => {
                if (b.status !== 'confirmed' || !b.slot) return false;
                const slotStart = new Date(`${b.slot.date}T${b.slot.startTime}:00`);
                return slotStart > new Date();
            });
            confirmed.sort((a, b) => {
                const aTime = new Date(`${a.slot.date}T${a.slot.startTime}:00`);
                const bTime = new Date(`${b.slot.date}T${b.slot.startTime}:00`);
                return aTime - bTime;
            });
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
            const msg = err.response?.data?.message || 'Failed to get meeting link';
            if (err.response?.data?.availableAt) {
                toast.info(`Link available at ${new Date(err.response.data.availableAt).toLocaleTimeString()}`);
            } else {
                toast.error(msg);
            }
        }
    };

    const handleResumeUpdate = async (bookingId, e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.type !== 'application/pdf') { toast.error('PDF only'); return; }
        if (file.size > 5 * 1024 * 1024) { toast.error('Max 5MB'); return; }

        try {
            const formData = new FormData();
            formData.append('resume', file);
            await updateResume(bookingId, formData);
            toast.success('Resume updated');
            fetchBookings();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update resume');
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-white">Upcoming Interviews</h1>

            {loading ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 h-32 animate-pulse" />)}</div>
            ) : bookings.length === 0 ? (
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-12 text-center">
                    <Clock className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">No upcoming interviews. Book one to get started!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map(b => {
                        const slotStart = new Date(`${b.slot.date}T${b.slot.startTime}:00`);
                        const fiveMinBefore = new Date(slotStart.getTime() - 5 * 60 * 1000);
                        const canJoin = new Date() >= fiveMinBefore;

                        return (
                            <div key={b.id} className="bg-[#111] border border-zinc-800/50 rounded-xl p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <p className="text-lg font-bold text-white">{b.slot.date}</p>
                                        <p className="text-zinc-400">{b.slot.startTime} – {b.slot.endTime} ({b.slot.duration} min)</p>
                                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            Starts in <CountdownTimer targetDate={`${b.slot.date}T${b.slot.startTime}:00`} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 shrink-0">
                                        {/* Resume */}
                                        {b.resumeUrl ? (
                                            <div className="flex items-center gap-2">
                                                <a href={`http://localhost:5000${b.resumeUrl}`} target="_blank" rel="noreferrer"
                                                    className="px-3 py-2 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5" /> View Resume
                                                </a>
                                                <button onClick={() => fileRefs.current[b.id]?.click()}
                                                    className="px-3 py-2 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
                                                    <Upload className="w-3.5 h-3.5" /> Update
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => fileRefs.current[b.id]?.click()}
                                                className="px-3 py-2 rounded-lg text-xs bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5">
                                                <Upload className="w-3.5 h-3.5" /> Upload Resume
                                            </button>
                                        )}
                                        <input
                                            ref={el => fileRefs.current[b.id] = el}
                                            type="file"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={(e) => handleResumeUpdate(b.id, e)}
                                        />

                                        {/* Join Meeting */}
                                        <button
                                            onClick={() => handleJoinMeeting(b.id)}
                                            disabled={!canJoin}
                                            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${canJoin
                                                    ? 'bg-white text-black hover:bg-zinc-200'
                                                    : 'bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed'
                                                }`}
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                            {canJoin ? 'Join Meeting' : 'Not yet'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
