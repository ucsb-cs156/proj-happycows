import React from "react";
import { Card } from "react-bootstrap";
import AnnouncementTable from "main/components/Announcement/AnnouncementTable";



const Profits = () =>{
    return (
        <Card>
            <Card.Body style={
                // Stryker disable next-line all: don't test CSS params
                {backgroundColor: "rgb(245, 210, 140)"}}>
                {/* change 4am to admin-appointed time? And consider adding milk bottle as decoration */}
                <Card.Title>
                    Important Announcements:
                </Card.Title>
                <AnnouncementTable/>
            </Card.Body>
        </Card>
    );
};

export default Profits;
