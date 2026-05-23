import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";

export default function AdminEditAnnouncementsPage() {
  const { commonsId, announcementId } = useParams();

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Announcement</h1>
        <h2>Not implemented yet; coming soon!</h2>
        <p>Commons ID: {commonsId}</p>
        <p>Announcement ID: {announcementId}</p>
      </div>
    </BasicLayout>
  );
}
