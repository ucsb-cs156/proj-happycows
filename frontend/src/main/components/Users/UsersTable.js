import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable"
import { formatTime } from "main/utils/dateUtils";
import { useNavigate } from 'react-router-dom';

export default function UsersTable({ users }) {

    const navigate = useNavigate();

    const suspendCallback = (row) => { 
        console.log(row)
        navigate(`/admin/suspend/user/${row.row.values.id}`)
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
    columns.push(ButtonColumn("Suspend", "danger", suspendCallback, "UsersTable"));

    return <OurTable
        data={users}
        columns={columns}
        testid={"UsersTable"} />;
};