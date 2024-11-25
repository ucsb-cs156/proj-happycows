import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { useParams, Navigate } from 'react-router-dom'
import { toast } from "react-toastify"

import { useBackend, useBackendMutation } from "main/utils/useBackend";

const AdminCreateAnnouncementsPage = () => {

    // Stryker disable all
    const objectToAxiosParams = (newAnnouncement) => ({
        url:`/api/announcements/post/${commonsId}`,
        method: "POST",
        params: {
            announcementText: newAnnouncement.announcementText,
            startDate: newAnnouncement.startDate,
            endDate: newAnnouncement.endDate,
        }
    });
    // Stryker restore all

    const { commonsId } = useParams(); 

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
    // Stryker restore all

    const commonsName = commonsPlus?.commons.name;

    // Stryker disable all
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
    // Stryker restore all
   
    // Stryker disable all
    const mutation = useBackendMutation(
        objectToAxiosParams,
        { onSuccess },
        ["/api/announcements/getbycommonsid"]
    );
    // Stryker restore all

    const submitAction = async (data) => {
        mutation.mutate(data);
    }

    // Stryker disable all
    if (mutation.isSuccess) {
        return <Navigate to="/" />
    }
    // Stryker restore all

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