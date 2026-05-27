import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { Navigate, useParams } from "react-router";
import { toast } from "react-toastify";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toBackendDateTime } from "main/utils/announcementUtils";

const nonBlankParam = (params, key, value) => {
  if (value) {
    params[key] = value;
  }
};

export default function AdminCreateAnnouncementsPage() {
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

  const objectToAxiosParams = (announcement) => {
    const params = {
      commonsId,
      announcementText: announcement.announcementText,
    };
    nonBlankParam(params, "startDate", toBackendDateTime(announcement.startDate));
    nonBlankParam(params, "endDate", toBackendDateTime(announcement.endDate));

    return {
      url: "/api/announcements/post",
      method: "POST",
      params,
    };
  };

  const onSuccess = (announcement) => {
    toast(`Announcement created - id: ${announcement.id}`);
  };

  // Stryker disable all
  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    [`/api/announcements/getbycommonsid?commonsId=${commonsId}`],
  );
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
        <h1>Create Announcement for Commons {commonsName}</h1>
        <AnnouncementForm submitAction={submitAction} />
      </div>
    </BasicLayout>
  );
}
