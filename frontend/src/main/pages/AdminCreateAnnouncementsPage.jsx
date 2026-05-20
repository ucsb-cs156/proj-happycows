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
      params: { id: commonsId },
    },
  );

  const mutation = useBackendMutation(
    (announcement) => ({
      method: "POST",
      url: "/api/announcements/post",
      data: announcement,
    }),
    {
      onSuccess: () => {
        toast("Announcement created");
        navigate(`/admin/announcements/${commonsId}`);
      },
    },
  );

  const submitAction = (data) => {
    mutation.mutate({
      ...data,
      commonsId: Number(commonsId),
      startDate: `${data.startDate}:00`,
      endDate: data.endDate ? `${data.endDate}:00` : null,
    });
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
