import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { useParams, Navigate } from 'react-router-dom'
import { toast } from "react-toastify"

import { useBackend, useBackendMutation } from "main/utils/useBackend";

const AdminCreateAnnouncementsPage = () => {
    const objectToAxiosParams = (newAnnouncement) => ({
        url:`/api/announcements/post/${commonsId}`,
        method: "POST",
        params: {
            announcementText: newAnnouncement.announcementText,
            startDate: newAnnouncement.startDate,
            endDate: newAnnouncement.endDate,
        }
    });

    const { commonsId } = useParams(); 

    // Stryker disable all (Copied from frontend/src/main/pages/AdminViewPlayPage.js)
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
    // Stryker restore all

    const commonsName = commonsPlus?.commons.name;

    const onSuccess = (announcement) => {
        toast(
          <div>
            <p>Announcement successfully created!</p>
            <ul>
              <li>{`ID: ${announcement.id}`}</li>
              <li>{`Start Date: ${announcement.startDate}`}</li>
              <li>{`End Date: ${announcement.endDate}`}</li>
              <li>{`Announcement: ${announcement.announcementText}`}</li>
            </ul>
          </div>
        );
      };

    // Stryker disable all (Copied from frontend/src/main/pages/AdminCreateCommonsPage.js)
    const mutation = useBackendMutation(
        objectToAxiosParams,
        { onSuccess },
        ["/api/announcements/getbycommonsid"]
    );
    // Stryker restore all

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