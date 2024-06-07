import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AnnouncementsForm from "main/components/Announcement/AnnouncementForm";
import { Navigate } from 'react-router-dom'
import { toast } from "react-toastify"
import { useBackend} from "main/utils/useBackend";
import { useBackendMutation } from "main/utils/useBackend";
import { useParams } from "react-router-dom";

const AdminCreateAnnouncement = () => {

    let { commonsId } = useParams();

    // Stryker disable all
    const { data: commonsPlus } = useBackend(
        [`/api/commons/plus?id=${commonsId}`],
        {
            method: "GET",
            url: "/api/commons/plus",
            params: {
                id: commonsId,
            },
        }
    );
    const commonsName = commonsPlus?.commons.name;

     const objectToAxiosParams = (newAnnouncement) => ({        
        url: "/api/announcements/post",
        method: "POST",
        params: {
            commonsId: newAnnouncement.commonsId,
            startDate: newAnnouncement.startDate,
            endDate: newAnnouncement.endDate,
            announcementText: newAnnouncement.announcementText
        }
    });

    const onSuccess = (newAnnouncement) => {
        toast(`New Announcement Created - commonsId: ${commonsId} id: ${newAnnouncement.id} startDate: ${newAnnouncement.startDate} endDate: ${newAnnouncement.endDate} announcmentText: ${newAnnouncement.announcementText}`);
    }
    
      // Stryker disable all
    const mutation = useBackendMutation(
        objectToAxiosParams,
        { onSuccess },
        // Stryker disable next-line all : hard to set up test for caching
        [`/api/announcements/getbycommonsid?commonsId=${commonsId}`]
    );
    // Stryker restore all

    const submitAction = async (data) => {
        mutation.mutate({ ...data, commonsId });
    }

    if (mutation.isSuccess) {
        return <Navigate to={`/admin/announcements/${commonsId}`} />
    }

    return (
        <BasicLayout>
            <h2>Create Announcement for {commonsName}</h2>
            <AnnouncementsForm
                submitAction={submitAction}
            />
        </BasicLayout>
    );
};

export default AdminCreateAnnouncement;