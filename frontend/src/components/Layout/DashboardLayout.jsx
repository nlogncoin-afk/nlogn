import React from 'react';
import Sidebar from './Sidebar';
import { motion } from 'framer-motion';

export default function DashboardLayout({ children, activeTab, setActiveTab, title }) {
    return (
        <div className="min-h-screen bg-black text-white font-sans flex">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 ml-64 p-8 md:p-12 overflow-y-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="max-w-6xl mx-auto"
                >
                    <header className="mb-8">
                        <h1 className="text-3xl font-display font-bold text-white">{title}</h1>
                        <p className="text-zinc-400 mt-1">Manage your interviews and preparation.</p>
                    </header>

                    <div className="bg-[#0a0a0a] border border-zinc-900 rounded-xl p-6 min-h-[60vh]">
                        {children}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
