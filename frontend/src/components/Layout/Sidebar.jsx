import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, LogOut, Code, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

export default function Sidebar({ activeTab, setActiveTab }) {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const adminNavItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'slots', label: 'Manage Slots', icon: Calendar },
        { id: 'bookings', label: 'All Bookings', icon: Code },
    ];

    const userNavItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'slots', label: 'Book Interview', icon: Calendar },
        { id: 'bookings', label: 'My Bookings', icon: Code },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    const navItems = user?.role === 'admin' ? adminNavItems : userNavItems;

    return (
        <aside className="w-64 bg-zinc-950 border-r border-zinc-900 min-h-screen flex flex-col fixed left-0 top-0">
            <div className="p-6 border-b border-zinc-900 flex items-center">
                <span className="text-xl font-display font-bold text-white tracking-tighter">nlogn</span>
            </div>

            <div className="flex-1 py-6 px-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`
                        w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200
                        ${isActive
                                    ? 'bg-white text-black'
                                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                                }
                    `}
                        >
                            <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-black' : 'text-zinc-500 group-hover:text-white'}`} />
                            {item.label}
                        </button>
                    )
                })}
            </div>

            <div className="p-4 border-t border-zinc-900">
                <div className="flex items-center mb-4 px-2">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-white mr-3">
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/30"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>
        </aside>
    );
}
