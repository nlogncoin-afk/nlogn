import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './Layout/DashboardLayout';
import AdminOverview from './Admin/AdminOverview';
import UserManagement from './Admin/UserManagement';
import SlotManagement from './Admin/SlotManagement';
import BookedSlots from './Admin/BookedSlots';
import JudgmentArea from './Admin/JudgmentArea';
import SubmittedReports from './Admin/SubmittedReports';

export default function AdminDashboard() {
    return (
        <Routes>
            <Route element={<DashboardLayout />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="slots" element={<SlotManagement />} />
                <Route path="booked" element={<BookedSlots />} />
                <Route path="judgment" element={<JudgmentArea />} />
                <Route path="reports" element={<SubmittedReports />} />
            </Route>
        </Routes>
    );
}
