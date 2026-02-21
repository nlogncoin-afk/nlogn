import React, { useState, useEffect } from 'react';
import { getAllUsers, getUserProfile, toggleBlockUser } from '../../../services/api';
import { toast } from 'react-toastify';
import { Search, Shield, ShieldOff, Eye, X } from 'lucide-react';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [blockModal, setBlockModal] = useState(null);
    const [blockReason, setBlockReason] = useState('');

    const fetchUsers = async () => {
        try {
            const res = await getAllUsers();
            setUsers(res.data.users || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const filtered = users.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleBlock = async () => {
        if (!blockModal) return;
        try {
            await toggleBlockUser(blockModal.id, {
                isBlocked: !blockModal.isBlocked,
                blockedReason: !blockModal.isBlocked ? blockReason : ''
            });
            toast.success(blockModal.isBlocked ? 'User unblocked' : 'User blocked');
            setBlockModal(null);
            setBlockReason('');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update user');
        }
    };

    const viewProfile = async (userId) => {
        try {
            const res = await getUserProfile(userId);
            setSelectedUser(res.data);
        } catch (err) {
            toast.error('Failed to load profile');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-display font-bold text-white">User Management</h1>
                <span className="text-sm text-zinc-500">{users.length} users</span>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 h-11 bg-[#111] border border-zinc-800 rounded-lg text-white text-sm placeholder:text-zinc-600 focus:border-zinc-600 outline-none transition-colors"
                />
            </div>

            {/* Table */}
            <div className="bg-[#111] border border-zinc-800/50 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-zinc-800 text-xs uppercase tracking-wider text-zinc-500">
                                <th className="px-5 py-4">Name</th>
                                <th className="px-5 py-4">Email</th>
                                <th className="px-5 py-4">Joined</th>
                                <th className="px-5 py-4">Interviews</th>
                                <th className="px-5 py-4">Status</th>
                                <th className="px-5 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="border-b border-zinc-800/30">
                                        <td colSpan="6" className="px-5 py-4"><div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4" /></td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="px-5 py-8 text-center text-zinc-500 text-sm">No users found.</td></tr>
                            ) : (
                                filtered.map(user => (
                                    <tr key={user.id} className="border-b border-zinc-800/30 hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-5 py-4 font-medium text-white text-sm">{user.fullName}</td>
                                        <td className="px-5 py-4 text-zinc-400 text-sm">{user.email}</td>
                                        <td className="px-5 py-4 text-zinc-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td className="px-5 py-4 text-zinc-400 text-sm">{user.completedCount}/{user.bookingCount}</td>
                                        <td className="px-5 py-4">
                                            {user.isBlocked ? (
                                                <span className="px-2.5 py-1 rounded-full text-xs bg-red-950/50 text-red-400 border border-red-900/50">Blocked</span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-xs bg-emerald-950/50 text-emerald-400 border border-emerald-900/50">Active</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => viewProfile(user.id)} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title="View Profile">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => { setBlockModal(user); setBlockReason(''); }} className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors" title={user.isBlocked ? 'Unblock' : 'Block'}>
                                                    {user.isBlocked ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Block/Unblock Modal */}
            {blockModal && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setBlockModal(null)}>
                    <div className="bg-[#111] border border-zinc-800 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {blockModal.isBlocked ? 'Unblock' : 'Block'} {blockModal.fullName}?
                        </h3>
                        <p className="text-sm text-zinc-400 mb-4">
                            {blockModal.isBlocked
                                ? 'This user will regain access to the platform.'
                                : 'This user will be immediately locked out of their account.'}
                        </p>
                        {!blockModal.isBlocked && (
                            <textarea
                                placeholder="Reason for blocking (optional)"
                                value={blockReason}
                                onChange={e => setBlockReason(e.target.value)}
                                className="w-full h-24 bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-zinc-600 mb-4 resize-none"
                            />
                        )}
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setBlockModal(null)} className="px-4 h-10 rounded-lg border border-zinc-800 text-zinc-400 text-sm hover:bg-zinc-900 transition-colors">Cancel</button>
                            <button onClick={handleBlock} className={`px-4 h-10 rounded-lg text-sm font-medium transition-colors ${blockModal.isBlocked ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
                                {blockModal.isBlocked ? 'Unblock User' : 'Block User'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Drawer */}
            {selectedUser && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end" onClick={() => setSelectedUser(null)}>
                    <div className="w-full max-w-lg bg-[#0a0a0a] border-l border-zinc-800 h-full overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">User Profile</h3>
                            <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-white">
                                    {selectedUser.user.fullName.charAt(0)}
                                </div>
                                <div>
                                    <p className="text-white font-medium">{selectedUser.user.fullName}</p>
                                    <p className="text-zinc-500 text-sm">{selectedUser.user.email}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3">
                                    <p className="text-xs text-zinc-500">Bookings</p>
                                    <p className="text-lg font-bold text-white">{selectedUser.bookings.length}</p>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-lg p-3">
                                    <p className="text-xs text-zinc-500">Reports</p>
                                    <p className="text-lg font-bold text-white">{selectedUser.reports.length}</p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-zinc-400 mb-3">Booking History</h4>
                                {selectedUser.bookings.length === 0 ? (
                                    <p className="text-zinc-600 text-sm">No bookings yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {selectedUser.bookings.map(b => (
                                            <div key={b.id} className="bg-zinc-900/30 border border-zinc-800/30 rounded-lg p-3 flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-white">{b.slot?.date} {b.slot?.startTime}</p>
                                                    <p className="text-xs text-zinc-500 capitalize">{b.status}</p>
                                                </div>
                                                {b.report && (
                                                    <span className="text-xs px-2 py-1 bg-blue-950/50 text-blue-400 rounded-full">{b.report.verdict}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
