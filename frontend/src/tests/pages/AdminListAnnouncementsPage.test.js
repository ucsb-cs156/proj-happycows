import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AdminListAnnouncementsPage from 'main/pages/AdminListAnnouncementsPage';



test('redirects to /not-found', () => {
    render(
        <MemoryRouter initialEntries={['/admin/announcements']}>
            <Routes>
                <Route path="/admin/announcements" element={<AdminListAnnouncementsPage />} />
                <Route path="/not-found" element={<div>404 Not Found</div>} />
            </Routes>
        </MemoryRouter>
    );
    expect(screen.getByText('404 Not Found')).toBeInTheDocument();
});