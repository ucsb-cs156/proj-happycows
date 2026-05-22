import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { Navigate } from "react-router";
import { toast } from "react-toastify";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { datetimeLocalToIsoDateTime } from "main/utils/announcementUtils";
import { useParams } from "react-router";

const AdminCreateAnnouncementsPage = () => {
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
    },
  );
  // Stryker restore all

  const commonsName = commonsPlus?.commons.name;

  const objectToAxiosParams = (newAnnouncement) => {
    const params = {
      commonsId,
      startDate: datetimeLocalToIsoDateTime(newAnnouncement.startDate),
      announcementText: newAnnouncement.announcementText,
    };
    if (newAnnouncement.endDate) {
      params.endDate = datetimeLocalToIsoDateTime(newAnnouncement.endDate);
    }
    return {
      url: "/api/announcements/post",
      method: "POST",
      params,
    };
  };

  const onSuccess = (newAnnouncement) => {
    toast(
      <div>
        Announcement successfully created!
        <br />
        {`commonsId: ${newAnnouncement.id}`}
        <br />
        {`startDate: ${newAnnouncement.startDate}`}
        <br />
        {`endDate: ${newAnnouncement.endDate}`}
        <br />
        {`announcementText: ${newAnnouncement.announcementText}`}
      </div>,
    );
  };

  // Stryker disable all
  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/announcements/all"],
  );
  // Stryker restore all

  const submitAction = async (data) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess) {
    return <Navigate to={`/admin/announcements/${commonsId}`} />;
  }

  return (
    <BasicLayout>
      <h2>Create Announcement for Commons {commonsName}</h2>
      <AnnouncementForm submitAction={submitAction} />
    </BasicLayout>
  );
};

export default AdminCreateAnnouncementsPage;
