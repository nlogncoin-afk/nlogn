import React, { useState, useEffect, useRef } from 'react';
import { getAvailableSlots, createBooking } from '../../../services/api';
import { toast } from 'react-toastify';
import { Calendar, Clock, Upload, AlertTriangle, FileText } from 'lucide-react';

export default function BookSlot() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [resume, setResume] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef(null);

    const fetchSlots = async () => {
        try {
            const res = await getAvailableSlots();
            setSlots(res.data.slots || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSlots(); }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024) {
            setResume(file);
        } else if (file) {
            toast.error('Please upload a PDF file (max 5MB)');
            e.target.value = '';
        }
    };

    const handleBook = async () => {
        if (!selectedSlot) return;
        if (!confirm('⚠️ Bookings are non-refundable and cannot be cancelled. Proceed?')) return;

        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('slotId', selectedSlot.id);
            if (resume) formData.append('resume', resume);

            await createBooking(formData);
            toast.success('Interview booked successfully!');
            setSelectedSlot(null);
            setResume(null);
            fetchSlots();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to book slot');
        } finally {
            setSubmitting(false);
        }
    };

    // Group by date
    const groupedByDate = slots.reduce((acc, slot) => {
        if (!acc[slot.date]) acc[slot.date] = [];
        acc[slot.date].push(slot);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-display font-bold text-white">Book Interview</h1>
                <p className="text-zinc-500 text-sm mt-1">Choose an available slot and upload your resume.</p>
            </div>

            {/* Non-refundable Warning */}
            <div className="bg-amber-950/20 border border-amber-900/30 rounded-xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-sm text-amber-300">All bookings are <span className="font-bold">non-refundable</span> and cannot be cancelled once confirmed.</p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <div key={i} className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 h-32 animate-pulse" />)}
                </div>
            ) : Object.keys(groupedByDate).length === 0 ? (
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-12 text-center">
                    <Calendar className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">No available slots right now. Check back later!</p>
                </div>
            ) : (
                Object.entries(groupedByDate).map(([date, dateSlots]) => (
                    <div key={date}>
                        <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {dateSlots.map(slot => (
                                <button
                                    key={slot.id}
                                    onClick={() => setSelectedSlot(selectedSlot?.id === slot.id ? null : slot)}
                                    className={`p-4 rounded-xl border text-left transition-all ${selectedSlot?.id === slot.id
                                            ? 'bg-white text-black border-white'
                                            : 'bg-[#111] border-zinc-800/50 text-white hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="text-sm font-bold">{slot.startTime}</span>
                                    </div>
                                    <p className={`text-xs ${selectedSlot?.id === slot.id ? 'text-zinc-600' : 'text-zinc-500'}`}>{slot.duration} min</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ))
            )}

            {/* Booking Panel */}
            {selectedSlot && (
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 space-y-4 mt-6">
                    <h3 className="text-lg font-bold text-white">Confirm Booking</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3">
                            <p className="text-xs text-zinc-500">Date</p>
                            <p className="text-sm font-medium text-white">{selectedSlot.date}</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3">
                            <p className="text-xs text-zinc-500">Time</p>
                            <p className="text-sm font-medium text-white">{selectedSlot.startTime} – {selectedSlot.endTime}</p>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3">
                            <p className="text-xs text-zinc-500">Duration</p>
                            <p className="text-sm font-medium text-white">{selectedSlot.duration} minutes</p>
                        </div>
                    </div>

                    {/* Resume Upload */}
                    <div>
                        <label className="text-sm text-zinc-400 mb-2 block">Resume (PDF, optional)</label>
                        <div
                            onClick={() => fileRef.current?.click()}
                            className="border-2 border-dashed border-zinc-800 rounded-xl p-6 text-center cursor-pointer hover:border-zinc-700 transition-colors"
                        >
                            <input ref={fileRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
                            {resume ? (
                                <div className="flex items-center justify-center gap-2 text-emerald-400">
                                    <FileText className="w-5 h-5" />
                                    <span className="text-sm">{resume.name}</span>
                                </div>
                            ) : (
                                <div>
                                    <Upload className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                                    <p className="text-sm text-zinc-500">Click to upload PDF (max 5MB)</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleBook}
                        disabled={submitting}
                        className="w-full h-12 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Booking...' : 'Confirm Booking'}
                    </button>
                </div>
            )}
        </div>
    );
}
