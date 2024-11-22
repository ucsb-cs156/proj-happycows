import React from "react";
import OurTable from "main/components/OurTable";
import { Button } from "react-bootstrap";
import { useBackend } from "main/utils/useBackend";
import { useParams } from "react-router-dom";


const PagedAnnouncementTable = () => {

    const testId = "PagedAnnouncementTable";
    const refreshJobsIntervalMilliseconds = 5000;

    const [selectedPage, setSelectedPage] = React.useState(0);

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

    const previousPageCallback = () => {
        return () => {
            setSelectedPage(selectedPage - 1);
        }
    }

    const nextPageCallback = () => {
        return () => {
            setSelectedPage(selectedPage + 1);
        }
    }

    const columns = 
        [
            {
                Header: "Start Date",
                accessor: "startDate",
            },
            {
                Header: "End Date",
                accessor: "endDate",
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

    const legalDate = React.useMemo(() => {
        const now = new Date();
        return page.content.filter((announcement) => {
            const startDate = new Date(announcement.startDate);
            return startDate <= now;
        });
    }, [page.content]);

    return (
        <>
            <p>Page: {selectedPage + 1}</p>
            <Button data-testid={`${testId}-previous-button`}onClick={previousPageCallback()} disabled={ selectedPage === 0}>Previous</Button>
            <Button data-testid={`${testId}-next-button`} onClick={nextPageCallback()} disabled={page.totalPages===0 || selectedPage === page.totalPages-1}>Next</Button>
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