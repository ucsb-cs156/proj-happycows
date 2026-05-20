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
    (params) => ({
      method: "PUT",
      url: "/api/announcements/put",
      params,
    }),
    {
      onSuccess: () => {
        toast("Announcement updated");
        navigate(`/admin/announcements/${commonsId}`);
      },
    },
  );

  const toBackendDate = (dateTimeLocal) => {
    const date = new Date(dateTimeLocal);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const pad = (n) => String(n).padStart(2, "0");
    const timezone = date
      .toLocaleTimeString("en-us", { timeZoneName: "short" })
      .split(" ")
      .pop();

    return `${days[date.getDay()]} ${
      months[date.getMonth()]
    } ${pad(date.getDate())} ${pad(date.getHours())}:${pad(
      date.getMinutes(),
    )}:00 ${timezone} ${date.getFullYear()}`;
  };

  const toDateTimeLocal = (backendDate) => {
    if (!backendDate) {
      return "";
    }

    return backendDate.substring(0, 16);
  };

  const submitAction = (data) => {
    const params = {
      id: Number(data.id),
      commonsId: Number(commonsId),
      announcementText: data.announcementText,
      startDate: toBackendDate(data.startDate),
    };

    if (data.endDate) {
      params.endDate = toBackendDate(data.endDate);
    }

    mutation.mutate(params);
  };

  const initialContents = announcement && {
    ...announcement,
    startDate: toDateTimeLocal(announcement.startDate),
    endDate: toDateTimeLocal(announcement.endDate),
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Announcement</h1>

        {initialContents && (
          <AnnouncementForm
            initialContents={initialContents}
            submitAction={submitAction}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
