import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useBackendMutation } from "main/utils/useBackend";
import { useBackend } from "main/utils/useBackend";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";

const AdminCreateAnnouncementPage = () => {
  const objectToAxiosParams = (newAnnouncement) => ({
    url: "/api/announcements/new",
    method: "POST",
    data: newAnnouncement,
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

  // Success handler
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

  // Backend mutation hook
  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess }, [
    "/api/announcements/all",
  ]);

  // Form submission handler
  const submitAction = async (data) => {
    mutation.mutate(data);
  };

  // Redirect after successful submission
  if (mutation.isSuccess) {
    return <Navigate to="/" />;
  }

  return (
    <BasicLayout>
      <h2>Create Announcement for { commonsName} </h2>
      <AnnouncementForm submitAction={submitAction} />
    </BasicLayout>
  );
};

export default AdminCreateAnnouncementPage;
