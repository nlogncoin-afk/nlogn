import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    Clock,
    Users,
    LogOut,
    BookOpen,
    Gavel,
    FileText,
    CalendarCheck,
    CalendarX,
    User,
    Menu,
    X
} from 'lucide-react';
import { Button } from '../../ui/Button';

export default function Sidebar() {
    const { user, logout } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [mobileOpen, setMobileOpen] = useState(false);

    const adminLinks = [
        { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
        { to: '/admin/users', icon: Users, label: 'User Management' },
        { to: '/admin/slots', icon: Clock, label: 'Slot Management' },
        { to: '/admin/booked', icon: CalendarCheck, label: 'Booked Slots' },
        { to: '/admin/judgment', icon: Gavel, label: 'Judgment Area' },
        { to: '/admin/reports', icon: FileText, label: 'Reports' },
    ];

    const userLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Overview', end: true },
        { to: '/dashboard/book', icon: Calendar, label: 'Book Interview' },
        { to: '/dashboard/upcoming', icon: CalendarCheck, label: 'Upcoming' },
        { to: '/dashboard/previous', icon: BookOpen, label: 'Previous' },
        { to: '/dashboard/not-attended', icon: CalendarX, label: 'Not Attended' },
        { to: '/dashboard/profile', icon: User, label: 'Profile' },
    ];

    const links = isAdmin ? adminLinks : userLinks;

    const sidebarContent = (
        <>
            <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800">
                <span className="text-xl font-display font-bold tracking-tighter text-white">nlogn</span>
                <button className="md:hidden text-zinc-400" onClick={() => setMobileOpen(false)}>
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {links.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        end={link.end}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-white text-black'
                                : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5 mr-3" />
                        {link.label}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-zinc-800">
                <div className="flex items-center mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold mr-3">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    className="w-full justify-start text-zinc-400 hover:text-red-400 hover:border-red-900 hover:bg-red-950/20"
                    onClick={logout}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger */}
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400"
                onClick={() => setMobileOpen(true)}
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="md:hidden fixed inset-0 bg-black/80 z-40" onClick={() => setMobileOpen(false)} />
            )}

            {/* Mobile sidebar */}
            <aside className={`md:hidden fixed left-0 top-0 z-50 w-64 bg-[#0a0a0a] border-r border-zinc-800 flex flex-col h-screen transition-transform duration-300 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                {sidebarContent}
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-64 bg-[#0a0a0a] border-r border-zinc-800 flex-col h-screen fixed left-0 top-0 z-40">
                {sidebarContent}
            </aside>
        </>
    );
}
