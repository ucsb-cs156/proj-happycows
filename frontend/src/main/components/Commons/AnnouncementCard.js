import React from "react";
import { Card } from "react-bootstrap";
import PagedAnnouncementTable from "main/components/Commons/PagedAnnouncementTable";



const AnnouncementCard = () =>{
    return (
        <Card>
            <Card.Header as="h5" className = "woodenboardtable">
                AnnouncementCard
            </Card.Header>
            <Card.Body style={
                // Stryker disable next-line all: don't test CSS params
                {backgroundColor: "rgb(245, 210, 140)"}}>
                {/* change 4am to admin-appointed time? And consider adding milk bottle as decoration */}
                <Card.Title>
                    Important Announcements:
                </Card.Title>
                <PagedAnnouncementTable/>
            </Card.Body>
        </Card>
    );
};

export default AnnouncementCard;
