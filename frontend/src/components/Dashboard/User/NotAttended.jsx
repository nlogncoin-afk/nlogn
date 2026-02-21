import React, { useState, useEffect } from 'react';
import { getMyBookings } from '../../../services/api';
import { CalendarX } from 'lucide-react';

export default function NotAttended() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await getMyBookings();
                const notAttended = (res.data.bookings || []).filter(b => b.status === 'not_attended');
                setBookings(notAttended);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-display font-bold text-white">Not Attended</h1>

            {loading ? (
                <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="bg-[#111] border border-zinc-800/50 rounded-xl p-6 h-20 animate-pulse" />)}</div>
            ) : bookings.length === 0 ? (
                <div className="bg-[#111] border border-zinc-800/50 rounded-xl p-12 text-center">
                    <CalendarX className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-500">No missed interviews. Keep up the good work!</p>
                </div>
            ) : (
                <>
                    <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-4">
                        <p className="text-sm text-red-300">
                            Repeated no-shows may lead to account restrictions. Please ensure you attend all booked interviews.
                        </p>
                    </div>
                    <div className="space-y-3">
                        {bookings.map(b => (
                            <div key={b.id} className="bg-[#111] border border-zinc-800/50 rounded-xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-white">{b.slot?.date || 'Unknown'}</p>
                                    <p className="text-xs text-zinc-500">{b.slot?.startTime} – {b.slot?.endTime}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {b.autoExpiredAt && (
                                        <span className="text-xs text-zinc-600">Auto-expired</span>
                                    )}
                                    <span className="px-2.5 py-1 rounded-full text-xs bg-red-950/50 text-red-400 border border-red-900/50">
                                        Not Attended
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
