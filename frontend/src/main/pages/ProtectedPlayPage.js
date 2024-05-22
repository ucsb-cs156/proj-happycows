import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useBackend } from 'main/utils/useBackend';
import { useCurrentUser } from 'main/utils/currentUser';
import PlayPage from 'main/pages/PlayPage';

const ProtectedPlayPage = () => {
    const { commonsId } = useParams();
    const { data: currentUser } = useCurrentUser();

    const { data: userCommons, error: userCommonsError } = useBackend(
        [`/api/usercommons/forcurrentuser?commonsId=${commonsId}`],
        {
            method: 'GET',
            url: '/api/usercommons/forcurrentuser',
            params: { commonsId },
        }
    );


    if (!userCommons && !userCommonsError) {
        return <Navigate to="/not-found" />;
    } else {
        return <PlayPage userCommons={userCommons} currentUser={currentUser} />;
    }


    
};

export default ProtectedPlayPage;
