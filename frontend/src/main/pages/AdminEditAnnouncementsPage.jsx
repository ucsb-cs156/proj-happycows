import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { Navigate } from "react-router";
import { toast } from "react-toastify";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { datetimeLocalToIsoDateTime } from "main/utils/announcementUtils";
import { useParams } from "react-router";

const AdminEditAnnouncementsPage = () => {
  const { gameId, announcementId } = useParams();

  // Stryker disable all
  const { data: gamePlus } = useBackend([`/api/game/plus?id=${gameId}`], {
    method: "GET",
    url: "/api/game/plus",
    params: {
      id: gameId,
    },
  });
  const { data: announcement } = useBackend(
    [`/api/announcements/getbyid?id=${announcementId}`],
    {
      method: "GET",
      url: "/api/announcements/getbyid",
      params: {
        id: announcementId,
      },
    },
  );
  // Stryker restore all

  const gameName = gamePlus?.game.name;

  const objectToAxiosParams = (editedAnnouncement) => {
    const idToUse = editedAnnouncement?.id ?? announcementId;
    const endDate = editedAnnouncement?.endDate;
    const params = {
      id: idToUse,
      gameId,
      startDate: datetimeLocalToIsoDateTime(editedAnnouncement?.startDate),
      announcementText: editedAnnouncement?.announcementText,
    };
    if (endDate) {
      params.endDate = datetimeLocalToIsoDateTime(endDate);
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
        {`gameId: ${editedAnnouncement.id}`}
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
    return <Navigate to={`/admin/announcements/${gameId}`} />;
  }

  return (
    <BasicLayout>
      <h2>Edit Announcement for Game {gameName}</h2>
      <AnnouncementForm
        initialContents={announcement}
        submitAction={submitAction}
        buttonLabel="Update"
      />
    </BasicLayout>
  );
};

export default AdminEditAnnouncementsPage;
