import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { useParams, Navigate } from 'react-router-dom'
import { toast } from "react-toastify"

import { useBackend, useBackendMutation } from "main/utils/useBackend";

// Stryker disable all
const AdminCreateAnnouncementsPage = () => {

    const objectToAxiosParams = (newAnnouncement) => ({
        url: "/api/announcements/new",
        method: "POST",
        data: newAnnouncement
    });

    const { commonsId } = useParams(); 

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

    const onSuccess = (announcement) => {
        toast(
          <div>
            <p>Announcement successfully created!</p>
            <ul>
              <li>{`ID: ${announcement.id}`}</li>
              <li>{`Start Date: ${announcement.startDate}`}</li>
              <li>{`End Date: ${announcement.endDate}`}</li>
              <li>{`Announcement: ${announcement.message}`}</li>
            </ul>
          </div>
        );
      };
   
    const mutation = useBackendMutation(
        objectToAxiosParams,
        { onSuccess },
        ["/api/announcements/all"]
    );

    const submitAction = async (data) => {
        mutation.mutate(data);
    }


    if (mutation.isSuccess) {
        return <Navigate to="/" />
    }

    return (
        <BasicLayout>
            <h2>Create Announcement for {commonsName}</h2>
            <AnnouncementForm
                submitAction={submitAction}
            />
        </BasicLayout>
    );
    
};


export default AdminCreateAnnouncementsPage;