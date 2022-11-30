import React from "react";
import OurTable from "main/components/OurTable";
import { hasRole } from "main/utils/currentUser";

export default function CowDeathTable({ cowDeaths, currentUser }) {

    const columns = [
        {
            Header: 'id',
            accessor: 'id'
        },
        {
            Header: "commons id",
            accessor: "commonsId"
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
            Header: '(admin) user id',
            accessor: 'userId'
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