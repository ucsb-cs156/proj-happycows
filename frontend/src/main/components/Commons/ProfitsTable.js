import React from "react";
import OurTable from "main/components/OurTable";

export default function ProfitsTable({ profits }) {

    const PROFIT_PAGE_SIZE = 5;
    const [currentPage, setCurrentPage] = React.useState(0);
    const totalPageCount = Math.ceil(profits.length / PROFIT_PAGE_SIZE);
    
    const indexOfLastRow = (currentPage + 1) * PROFIT_PAGE_SIZE;
    const indexOfFirstRow = indexOfLastRow - PROFIT_PAGE_SIZE;
    const currentRows = profits.slice(indexOfFirstRow, indexOfLastRow);
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };
    const columns = [
        {
            Header: "Profit",
            accessor: (row) => `$${row.amount.toFixed(2)}`,
        },
        {
            Header: "Date",
            accessor: "timestamp",
            Cell: ({ value }) => {
                const date = new Date(value);
                return date.toLocaleString('en-US', {
                    year: 'numeric', month: 'numeric', day: 'numeric',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    hour12: false
                });
            }
        },
        {
            Header: "Health",
            accessor: (row) => `${row.avgCowHealth.toFixed(3)}%`
        },
        {
            Header: "Cows",
            accessor: "numCows",
        },
    ];
    const buttonStyle = {
        backgroundColor: '#007bff',
        color: 'white',
        borderRadius: '20px',
        padding: '5px 15px',
        margin: '0 5px',
        cursor: 'pointer',
        marginTop: '20px'
    };

    const disabledButtonStyle = {
        ...buttonStyle,
        backgroundColor: '#cccccc',
        cursor: 'not-allowed'
    };

    return (
        <div>
            <OurTable
                data={currentRows}
                columns={columns}
                testid={"ProfitsTable"}
            />
            <div>
                <button 
                    style={currentPage === 0 ? disabledButtonStyle : buttonStyle}
                    onClick={() => handlePageChange(0)}
                    disabled={currentPage === 0}
                >
                    First
                </button>
                <button 
                    style={currentPage === 0 ? disabledButtonStyle : buttonStyle}
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                >
                    Previous
                </button>
                <button 
                    style={currentPage >= totalPageCount - 1 ? disabledButtonStyle : buttonStyle}
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPageCount - 1}
                >
                    Next
                </button>
                <button 
                    style={currentPage >= totalPageCount - 1 ? disabledButtonStyle : buttonStyle}
                    onClick={() => handlePageChange(totalPageCount - 1)}
                    disabled={currentPage >= totalPageCount - 1}
                >
                    Last
                </button>
            </div>
        </div>
    );
}
