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

  const submitAction = (data) => {
    const params = {
      commonsId: Number(commonsId),
      announcementText: data.announcementText,
      startDate: toBackendDate(data.startDate),
    };

    if (data.endDate) {
      params.endDate = toBackendDate(data.endDate);
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
