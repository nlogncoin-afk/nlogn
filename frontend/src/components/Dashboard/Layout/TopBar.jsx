import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Bell } from 'lucide-react';

export default function TopBar() {
    const { user } = useAuth();
    const roleLabel = user?.role === 'admin' ? 'Admin' : 'Candidate';

    return (
        <header className="h-16 bg-[#0a0a0a]/50 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-8 sticky top-0 z-30">
            <div>
                <h2 className="text-lg font-medium text-white">Dashboard</h2>
            </div>

            <div className="flex items-center gap-4">
                <span className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-400">
                    {roleLabel}
                </span>
                <button className="text-zinc-400 hover:text-white transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
            </div>
        </header>
    );
}
