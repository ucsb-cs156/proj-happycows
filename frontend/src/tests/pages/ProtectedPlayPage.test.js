import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedPlayPage from 'main/pages/ProtectedPlayPage';
import { useCurrentUser } from 'main/utils/currentUser';

jest.mock('main/utils/currentUser');

jest.mock('main/pages/PlayPage', () => {
    return function MockedPlayPage() {
        return <div>Mocked PlayPage</div>;
    };
});

describe('ProtectedPlayPage', () => {
    const renderComponent = (commonsId, currentUser) => {
        useCurrentUser.mockReturnValue({ data: currentUser });
        
        return render(
            <MemoryRouter initialEntries={[`/play/${commonsId}`]}>
                <Routes>
                    <Route path="/play/:commonsId" element={<ProtectedPlayPage />} />
                    <Route path="/not-found" element={<div>Not Found Page</div>} />
                </Routes>
            </MemoryRouter>
        );
    };

    test('renders PlayPage if user is in the commons', () => {
        const currentUser = {
            root: {
                user: {
                    commons: [{ id: 1 }, { id: 2 }]
                }
            }
        };
        renderComponent(2, currentUser);
        expect(screen.getByText('Mocked PlayPage')).toBeInTheDocument();
    });

    test('navigates to Not Found page if user is not in the commons', () => {
        const currentUser = {
            root: {
                user: {
                    commons: [{ id: 1 }, { id: 3 }]
                }
            }
        };
        renderComponent(2, currentUser);
        expect(screen.getByText('Not Found Page')).toBeInTheDocument();
    });

    test('navigates to Not Found page if currentUser is null', () => {
        renderComponent(2, null);
        expect(screen.getByText('Not Found Page')).toBeInTheDocument();
    });

    test('navigates to Not Found page if currentUser exists and commons is not an array', () => {
        const currentUser = {
            root: {
                user: {
                    commons: null
                }
            }
        };
        renderComponent(1, currentUser);
        expect(screen.getByText('Not Found Page')).toBeInTheDocument();
    });

    test('navigates to Not Found page if user component does not exist', () => {
        const currentUser = {
            root: { 
            }
        };
        renderComponent(1, currentUser);
        expect(screen.getByText('Not Found Page')).toBeInTheDocument();
    });

    test('navigates to Not Found page if root component does not exist', () => {
        const currentUser = {
        };
        renderComponent(1, currentUser);
        expect(screen.getByText('Not Found Page')).toBeInTheDocument();
    });
});
