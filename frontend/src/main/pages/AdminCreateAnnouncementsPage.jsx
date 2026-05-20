import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { useNavigate, useParams } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function AdminCreateAnnouncementsPage() {
  const { commonsId } = useParams();
  const navigate = useNavigate();

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

  const mutation = useBackendMutation(
    (params) => ({
      url: "/api/announcements/post",
      method: "POST",
      params,
    }),
    {
      onSuccess: () => {
        toast("Announcement created");
        navigate(`/admin/announcements/${commonsId}`);
      },
    },
  );

  const submitAction = (data) => {
    const params = {
      commonsId: Number(commonsId),
      announcementText: data.announcementText,
      startDate: `${data.startDate.replace("T", " ")}:00`,
    };

    if (data.endDate) {
      params.endDate = `${data.endDate.replace("T", " ")}:00`;
    }

    mutation.mutate(params);
  };

  const commonsName = commonsPlus?.commons.name;

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create Announcement</h1>
        <h2>for Commons: {commonsName}</h2>

        <AnnouncementForm submitAction={submitAction} buttonLabel="Create" />
      </div>
    </BasicLayout>
  );
}
