import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-black text-white">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col">
                <TopBar />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
