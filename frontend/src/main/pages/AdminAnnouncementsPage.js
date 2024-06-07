
import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useBackend} from "main/utils/useBackend";
import { useParams } from "react-router-dom";
import AnnouncementTable from "main/components/Announcement/AnnouncementTable";
import { useCurrentUser } from "main/utils/currentUser";
import { Button } from "react-bootstrap";

export default function AdminAnnouncementsPage() {
    let { commonsId } = useParams();
    const currentUser = useCurrentUser();

    // Stryker disable all
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

    const { data: announcements, error: _error, status: _status } =
     useBackend(
      // Stryker disable next-line all : don't test internal caching of React Query
      [`api/announcements/getbycommonsid?commonsId=${commonsId}`],
      {  // Stryker disable next-line all : GET is the default, so changing this to "" doesn't introduce a bug
        method: "GET",
        url: `/api/announcements/getbycommonsid`,
        params: {
            commonsId
        }
      },
      // Stryker disable next-line all : don't test default value of empty list
      []
    );

    return (
        <BasicLayout>
            <div className="pt-2">
                <h1>Announcements for {commonsName}</h1>
                <Button
                    variant="primary"
                    href={`/admin/announcements/${commonsId}/create`}
                    style={{ float: "right" }}
                >
                    Create Announcement 
                </Button>
                <AnnouncementTable announcements={announcements} currentUser={currentUser}/>
            </div>
        </BasicLayout>
    )
    
}