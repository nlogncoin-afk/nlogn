import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './Layout/DashboardLayout';
import UserOverview from './User/UserOverview';
import BookSlot from './User/BookSlot';
import UpcomingInterviews from './User/UpcomingInterviews';
import PreviousInterviews from './User/PreviousInterviews';
import NotAttended from './User/NotAttended';
import UserProfile from './User/UserProfile';

export default function UserDashboard() {
    return (
        <Routes>
            <Route element={<DashboardLayout />}>
                <Route index element={<UserOverview />} />
                <Route path="book" element={<BookSlot />} />
                <Route path="upcoming" element={<UpcomingInterviews />} />
                <Route path="previous" element={<PreviousInterviews />} />
                <Route path="not-attended" element={<NotAttended />} />
                <Route path="profile" element={<UserProfile />} />
            </Route>
        </Routes>
    );
}
