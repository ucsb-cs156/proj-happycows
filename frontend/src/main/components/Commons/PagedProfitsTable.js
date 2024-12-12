import React from "react";
import OurTable from "main/components/OurTable";
import { Button } from "react-bootstrap";
import { useBackend } from "main/utils/useBackend";
import { useParams } from "react-router-dom";
import { timestampToDate } from "main/utils/dateUtils";


const PagedProfitsTable = () => {

    const testId = "PagedProfitsTable";
    const refreshJobsIntervalMilliseconds = 5000;

    const [selectedPage, setSelectedPage] = React.useState(0);

    const PROFIT_PAGE_SIZE = 5;
    const { commonsId } = useParams();

    // Stryker disable all
    const {
        data: page
    } = useBackend(
        ["/api/profits/paged/commonsid"],
        {
            method: "GET",
            url: "/api/profits/paged/commonsid", 
            params: {
                commonsId: commonsId,
                pageNumber: selectedPage,
                pageSize: PROFIT_PAGE_SIZE,
            }
        },
        {content: [], totalPages: 0},
        { refetchInterval: refreshJobsIntervalMilliseconds }
    );
    // Stryker restore  all

    const testid = "PagedProfitsTable";

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
                Header: "Profit",
                accessor: "amount",
                Cell: ({value}) => `$${value.toFixed(2)}`,
            },
            {
                Header: "Date",
                accessor: "timestamp",
                Cell: ({ value }) => timestampToDate(value),
            },
            {
                Header: "Health",
                accessor: "avgCowHealth",
                Cell: ({value}) => `${value.toFixed(2) + '%'}`
            },
            {
                Header: "Cows",
                accessor: "numCows",
            },
        ];


    const sortees = React.useMemo(
        () => [
            {
                id: "timestamp",
                desc: true
            }
        ],
        // Stryker disable next-line all
        []
    );


    return (
        <>
            <p>Page: {selectedPage + 1}</p>
            {selectedPage > 0 && <Button data-testid={`${testId}-previous-button`}onClick={previousPageCallback()}>
                Previous</Button>}
            {selectedPage < page.totalPages - 1 && <Button data-testid={`${testId}-next-button`} onClick={nextPageCallback()} >Next</Button>}
            <div 
                data-testid="PagedProfitsTable-container" 
                style={{display: 'flex'}}
            >
                    < OurTable
                        data={page.content}
                        columns={columns}
                        testid={testid}
                        initialState={{ sortBy: sortees }}
                    />
            </div>
        </>
    );
    
}; 

export default PagedProfitsTable;