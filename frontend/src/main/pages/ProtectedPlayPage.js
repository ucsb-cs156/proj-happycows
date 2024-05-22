import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useCurrentUser } from 'main/utils/currentUser';
import PlayPage from 'main/pages/PlayPage';

const ProtectedPlayPage = () => {
    const { commonsId } = useParams();
    const { data: currentUser} = useCurrentUser();

    const isUserInCommons = currentUser?.root?.user?.commons?.some(
        (commons) => commons.id === parseInt(commonsId)
    );

    if (!isUserInCommons) {
        return <Navigate to="/not-found" />;
    }

    return <PlayPage currentUser={currentUser} />;
};

export default ProtectedPlayPage;
