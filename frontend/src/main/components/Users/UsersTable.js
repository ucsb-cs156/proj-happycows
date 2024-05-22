import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable"
import { formatTime } from "main/utils/dateUtils";
import { useNavigate } from 'react-router-dom';

export default function UsersTable({ users }) {

    const navigate = useNavigate();

    const removeCallback = (_cell) => { 
        navigate(`/admin/remove/user/${users.id}`)
    }
    
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

    // don't need to check for admin because this page will not display if not admin
    columns.push(ButtonColumn("Edit Commons", "danger", removeCallback, "UsersTable"));

    return <OurTable
        data={users}
        columns={columns}
        testid={"UsersTable"} />;
};