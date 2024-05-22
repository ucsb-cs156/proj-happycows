import React from 'react';
import { render } from '@testing-library/react';
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
        const { getByText } = renderComponent(2, currentUser);
        expect(getByText('Mocked PlayPage')).toBeInTheDocument();
    });

    test('navigates to Not Found page if user is not in the commons', () => {
        const currentUser = {
            root: {
                user: {
                    commons: [{ id: 1 }, { id: 3 }]
                }
            }
        };
        const { getByText } = renderComponent(2, currentUser);
        expect(getByText('Not Found Page')).toBeInTheDocument();
    });

    test('navigates to Not Found page if currentUser is null', () => {
        const { getByText } = renderComponent(2, null);
        expect(getByText('Not Found Page')).toBeInTheDocument();
    });

    test('renders PlayPage if currentUser exists and commons is empty', () => {
        const currentUser = {
            root: {
                user: {
                    commons: []
                }
            }
        };
        const { getByText } = renderComponent(1, currentUser);
        expect(getByText('Not Found Page')).toBeInTheDocument();
    });

    test('renders PlayPage if currentUser exists and commons is not an array', () => {
        const currentUser = {
            root: {
                user: {
                    commons: null
                }
            }
        };
        const { getByText } = renderComponent(1, currentUser);
        expect(getByText('Not Found Page')).toBeInTheDocument();
    });
});
