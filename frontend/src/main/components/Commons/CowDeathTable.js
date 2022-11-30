import React from "react";
import OurTable from "main/components/OurTable";
import { hasRole } from "main/utils/currentUser";

export default function CowDeathTable({ cowDeaths, currentUser }) {

    const columns = [
        {
            Header: "commons id",
            accessor: "commonsId"
        },
        {
            Header: 'user id',
            accessor: 'userId'
        },
        {
            Header:'Created At',
            accessor: 'createdAt'
        },
        {
            Header: 'Cows Killed',
            accessor: 'cowsKilled'
        },
        {
            Header: 'Average Health',
            accessor: 'avgHealth'
        }
    ];

    const testid = "CowDeathTable";

    const columnsIfAdmin = [
        {
            Header: 'id',
            accessor: 'id'
        },
        ...columns
    ];

    const columnsToDisplay = hasRole(currentUser, "ROLE_ADMIN") ? columnsIfAdmin : columns;

    return <OurTable
        data={cowDeaths}
        columns={columnsToDisplay}
        testid={testid}
    />;
}