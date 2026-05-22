import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { Navigate } from "react-router";
import { toast } from "react-toastify";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { datetimeLocalToIsoDateTime } from "main/utils/announcementUtils";
import { useParams } from "react-router";

const AdminEditAnnouncementsPage = () => {
  const { commonsId, announcementId} = useParams();

  // Stryker disable all
  const { data: commonsPlus } = useBackend(
    [`/api/commons/plus?id=${commonsId}`],
    {
      method: "GET",
      url: "/api/commons/plus",
      params: { 
        id: commonsId
      },
    },
  );
  const { data: announcement } = useBackend(
    [`/api/announcements/getbyid?id=${announcementId}`],
    {
      method: "GET",
      url: "/api/announcements/getbyid",
      params: {
        id: announcementId
      },
    },
  );
  // Stryker restore all

  const commonsName = commonsPlus?.commons.name;

  const objectToAxiosParams = (editedAnnouncement) => {
    const idToUse = editedAnnouncement?.id ?? announcementId;
    const params = {
      id: idToUse,
      commonsId,
      startDate: datetimeLocalToIsoDateTime(editedAnnouncement.startDate),
      announcementText: editedAnnouncement.announcementText,
    };
    if (editedAnnouncement.endDate) {
      params.endDate = datetimeLocalToIsoDateTime(editedAnnouncement.endDate);
    }
    return {
      url: "/api/announcements/put",
      method: "PUT",
      params,
    };
  };

  const onSuccess = (editedAnnouncement) => {
    toast(
      <div>
        Announcement successfully edited!
        <br />
        {`commonsId: ${editedAnnouncement.id}`}
        <br />
        {`startDate: ${editedAnnouncement.startDate}`}
        <br />
        {`endDate: ${editedAnnouncement.endDate}`}
        <br />
        {`announcementText: ${editedAnnouncement.announcementText}`}
      </div>,
    );
  };

  // Stryker disable all
  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/announcements?id=${announcementId}`],
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
      <h2>Edit Announcement for Commons {commonsName}</h2>
      <AnnouncementForm
        initialAnnouncement={announcement}
        submitAction={submitAction} 
        buttonLabel="Update"
      />
    </BasicLayout>
  );
};

export default AdminEditAnnouncementsPage;
