import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { Navigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { useQueryClient } from "react-query";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toBackendDateTime } from "main/utils/announcementUtils";

const nonBlankParam = (params, key, value) => {
  if (value) {
    params[key] = value;
  }
};

export default function AdminEditAnnouncementsPage() {
  const { commonsId, id } = useParams();
  const queryClient = useQueryClient();

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

  const { data: announcement } = useBackend(
    [`/api/announcements/getbyid?id=${id}`],
    {
      method: "GET",
      url: "/api/announcements/getbyid",
      params: {
        id,
      },
    },
    undefined,
    { refetchOnMount: "always" },
  );
  // Stryker restore all

  const objectToAxiosParams = (updatedAnnouncement) => {
    const params = {
      id,
      commonsId,
      announcementText: updatedAnnouncement.announcementText,
    };
    nonBlankParam(
      params,
      "startDate",
      toBackendDateTime(updatedAnnouncement.startDate),
    );
    nonBlankParam(
      params,
      "endDate",
      toBackendDateTime(updatedAnnouncement.endDate),
    );

    return {
      url: "/api/announcements/put",
      method: "PUT",
      params,
    };
  };

  const onSuccess = () => {
    toast(`Announcement updated - id: ${id}`);
    queryClient.invalidateQueries(
      `/api/announcements/getbycommonsid?commonsId=${commonsId}`,
    );
    queryClient.invalidateQueries(`/api/announcements/getbyid?id=${id}`);
  };

  // Stryker disable all
  const mutation = useBackendMutation(objectToAxiosParams, { onSuccess });
  // Stryker restore all

  const submitAction = async (data) => {
    mutation.mutate(data);
  };

  if (mutation.isSuccess) {
    return <Navigate to={`/admin/announcements/${commonsId}`} />;
  }

  const commonsName = commonsPlus?.commons.name;

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Announcement for Commons {commonsName}</h1>
        {announcement && (
          <AnnouncementForm
            initialContents={announcement}
            submitAction={submitAction}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
