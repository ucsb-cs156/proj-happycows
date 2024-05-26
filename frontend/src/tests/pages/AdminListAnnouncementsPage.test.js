import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import AdminListAnnouncementsPage from 'main/pages/AdminListAnnouncementsPage';



test('redirects to /not-found', () => {
    const { getByText } = render(
        <MemoryRouter initialEntries={['/admin/announcements']}>
            <Routes>
                <Route path="/admin/announcements" element={<AdminListAnnouncementsPage />} />
                <Route path="/not-found" element={<div>404 Not Found</div>} />
            </Routes>
        </MemoryRouter>
    );
    expect(getByText('404 Not Found')).toBeInTheDocument();
});