import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable"
import { formatTime } from "main/utils/dateUtils";


export default function UsersTable({ users }) {

    // Stryker disable next-line all : TODO create this function & test it
    const removeCallback = (_cell) => { }
        // TODO: create a page and navigate to it
        // navigate(`/articles/edit/${cell.row.values.id}`)
    

    const columns = [
        {
            Header: 'id',
            accessor: 'id', // accessor is the "key" in the data
        },
        {
            Header: 'First Name',
            accessor: 'givenName',
        },
        {
            Header: 'Last Name',
            accessor: 'familyName',
        },
        {
            Header: 'Email',
            accessor: 'email',
        },
        {
            Header: 'Last Online',
            id: 'lastOnline',
            accessor: (row) => formatTime(row.lastOnline),
        },
        {
            Header: 'Admin',
            id: 'admin',
            accessor: (row, _rowIndex) => String(row.admin) // hack needed for boolean values to show up
        },
    ];

    // if (hasRole(currentUser, "ROLE_ADMIN")) {
    // don't need to check for admin because this page will not display if not admin
    columns.push(ButtonColumn("Remove", "danger", removeCallback, "UsersTable"));
    // } 

    return <OurTable
        data={users}
        columns={columns}
        testid={"UsersTable"} />;
};