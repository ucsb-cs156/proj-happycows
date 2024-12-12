import React from "react";
import OurTable from "main/components/OurTable";
import { useBackend } from "main/utils/useBackend";
import { useParams } from "react-router-dom";
import { timestampToDate } from "main/utils/dateUtils";


const PagedAnnouncementTable = () => {

    const refreshJobsIntervalMilliseconds = 5000;

    const { commonsId } = useParams();

    // Stryker disable all
    const {
        data: page
    } = useBackend(
        ["/api/announcements/getbycommonsid"],
        {
            method: "GET",
            url: "/api/announcements/getbycommonsid", 
            params: {
                commonsId: commonsId,
            }
        },
        {content: [], totalPages: 0},
        { refetchInterval: refreshJobsIntervalMilliseconds }
    );
    // Stryker restore  all

    const testid = "PagedAnnouncementTable";

    const columns = 
        [
            {
                Header: "Start Date",
                accessor: "startDate",
                Cell: ({ value }) => timestampToDate(value),
            },
            {
                Header: "End Date",
                accessor: "endDate",
                Cell: ({ value }) => (value ? timestampToDate(value) : ""),
            },
            {
                Header: 'Important Announcements',
                accessor: 'announcementText',
            },
        ];


    const sortees = React.useMemo(
        () => [
            {
                id: "startDate",
                desc: true
            }
        ],
        // Stryker disable next-line all
        []
    );

    const legalDate = React.useMemo(
        () => {
            const now = new Date();
            return page.content.filter((announcement) => {
                const startDate = new Date(announcement.startDate);
                const endDate = announcement.endDate ? new Date(announcement.endDate) : null;;
                if (!endDate) {
                    return startDate <= now;
                } 
                else {
                    return (startDate <= now) && (now <= endDate);
                }
            });
        },
        // Stryker disable next-line all
        [page.content]
    );

    return (
        <>
            < OurTable
                data={legalDate}
                columns={columns}
                testid={testid}
                initialState={{ sortBy: sortees }}

            />
        </>
    );
}; 

export default PagedAnnouncementTable;