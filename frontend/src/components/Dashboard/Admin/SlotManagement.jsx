import React, { useState, useEffect } from 'react';
import { createBatchSlots, getAllSlots, updateSlot, deleteSlot } from '../../../services/api';
import { toast } from 'react-toastify';
import { Plus, Trash2, X, Clock } from 'lucide-react';

export default function SlotManagement() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ date: '', startTime: '', endTime: '', duration: 60 });
    const [submitting, setSubmitting] = useState(false);
    const [filter, setFilter] = useState('all'); // all, available, booked, cancelled

    const fetchSlots = async () => {
        try {
            const res = await getAllSlots();
            setSlots(res.data.slots || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSlots(); }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await createBatchSlots(form);
            toast.success(`Created ${res.data.count} slot(s)`);
            setShowCreate(false);
            setForm({ date: '', startTime: '', endTime: '', duration: 60 });
            fetchSlots();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create slots');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id) => {
        if (!confirm('Cancel this slot?')) return;
        try {
            await updateSlot(id, { status: 'cancelled' });
            toast.success('Slot cancelled');
            fetchSlots();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Permanently delete this slot?')) return;
        try {
            await deleteSlot(id);
            toast.success('Slot deleted');
            fetchSlots();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        }
    };

    const filtered = slots.filter(s => filter === 'all' || s.status === filter);

    const statusColor = {
        available: 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50',
        booked: 'bg-blue-950/50 text-blue-400 border border-blue-900/50',
        cancelled: 'bg-zinc-800/50 text-zinc-500 border border-zinc-700/50'
    };

    // Preview: how many slots will be generated
    const previewCount = (() => {
        if (!form.startTime || !form.endTime || !form.duration) return 0;
        const [sh, sm] = form.startTime.split(':').map(Number);
        const [eh, em] = form.endTime.split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        if (start >= end) return 0;
        return Math.floor((end - start) / Number(form.duration));
    })();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-bold text-white">Slot Management</h1>
                <button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-2 px-4 h-10 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">
                    <Plus className="w-4 h-4" /> Create Slots
                </button>
            </div>

            {/* Create Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
                    <div className="bg-[#111] border border-zinc-800 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white">Batch Create Slots</h3>
                            <button onClick={() => setShowCreate(false)} className="text-zinc-400 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="text-sm text-zinc-400 mb-1 block">Date</label>
                                <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required
                                    className="w-full h-11 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-white text-sm outline-none focus:border-zinc-600" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-sm text-zinc-400 mb-1 block">Start Time</label>
                                    <input type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} required
                                        className="w-full h-11 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-white text-sm outline-none focus:border-zinc-600" />
                                </div>
                                <div>
                                    <label className="text-sm text-zinc-400 mb-1 block">End Time</label>
                                    <input type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} required
                                        className="w-full h-11 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-white text-sm outline-none focus:border-zinc-600" />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm text-zinc-400 mb-1 block">Duration (minutes)</label>
                                <select value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                                    className="w-full h-11 bg-zinc-950 border border-zinc-800 rounded-lg px-3 text-white text-sm outline-none focus:border-zinc-600">
                                    <option value={30}>30 min</option>
                                    <option value={45}>45 min</option>
                                    <option value={60}>60 min</option>
                                    <option value={90}>90 min</option>
                                </select>
                            </div>
                            {previewCount > 0 && (
                                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3">
                                    <p className="text-sm text-zinc-400">
                                        <Clock className="w-4 h-4 inline mr-1" />
                                        This will create <span className="text-white font-bold">{previewCount}</span> slot{previewCount > 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}
                            <button type="submit" disabled={submitting || previewCount === 0}
                                className="w-full h-11 bg-white text-black rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
                                {submitting ? 'Creating...' : `Create ${previewCount} Slot(s)`}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {['all', 'available', 'booked', 'cancelled'].map(f => (
                    <button key={f} onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${filter === f ? 'bg-white text-black font-medium' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'}`}>
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-[#111] border border-zinc-800/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                                <th className="px-5 py-4">Date</th>
                                <th className="px-5 py-4">Time</th>
                                <th className="px-5 py-4">Duration</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4">Booked By</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-zinc-800/30"><td colSpan="6" className="px-5 py-4"><div className="h-4 bg-zinc-800 rounded animate-pulse" /></td></tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="px-5 py-8 text-center text-zinc-500 text-sm">No slots found.</td></tr>
                            ) : (
                                filtered.map(slot => (
                                    <tr key={slot.id} className="border-b border-zinc-800/30 hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-5 py-4 text-white text-sm font-medium">{slot.date}</td>
                                        <td className="px-5 py-4 text-zinc-400 text-sm">{slot.startTime} - {slot.endTime}</td>
                                        <td className="px-5 py-4 text-zinc-400 text-sm">{slot.duration}m</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs ${statusColor[slot.status] || 'text-zinc-400'}`}>
                                                {slot.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-zinc-400 text-sm">
                                            {slot.booking ? slot.booking.userName : '—'}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            {slot.status === 'available' && (
                                                <div className="flex items-center justify-end gap-2">
                                                    <button onClick={() => handleCancel(slot.id)} className="px-3 py-1.5 rounded-lg text-xs bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-colors">Cancel</button>
                                                    <button onClick={() => handleDelete(slot.id)} className="p-1.5 rounded-lg hover:bg-red-950/30 text-zinc-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            )}
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
