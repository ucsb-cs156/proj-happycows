import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AnnouncementForm from "main/components/Announcement/AnnouncementForm";
import { useNavigate, useParams } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function AdminEditAnnouncementsPage() {
  const { commonsId, announcementId } = useParams();
  const navigate = useNavigate();

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

  const mutation = useBackendMutation(
    (updatedAnnouncement) => ({
      method: "PUT",
      url: "/api/announcements/put",
      data: updatedAnnouncement,
    }),
    {
      onSuccess: () => {
        toast("Announcement updated");
        navigate(`/admin/announcements/${commonsId}`);
      },
    },
  );

  const submitAction = (data) => {
    mutation.mutate(data);
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Announcement</h1>

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
