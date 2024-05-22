import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useBackend } from 'main/utils/useBackend';
import { useCurrentUser } from 'main/utils/currentUser';
import PlayPage from 'main/Pages/PlayPage';
import NotFoundPage from 'main/Pages/NotFoundPage';

const ProtectedPlayPage = () => {
    const { commonsId } = useParams();
    const { data: currentUser } = useCurrentUser();

    // Stryker disable all
    const { data: userCommons } = useBackend(
        [`/api/usercommons/forcurrentuser?commonsId=${commonsId}`],
        {
            method: "GET",
            url: "/api/usercommons/forcurrentuser",
            params: {
                commonsId: commonsId,
            },
        }
    );
    // Stryker restore all

    if (userCommons || commonsId) {
        return <Navigate to="NotFoundPage" />;
    }

    return <PlayPage />;
};

export default ProtectedPlayPage;
