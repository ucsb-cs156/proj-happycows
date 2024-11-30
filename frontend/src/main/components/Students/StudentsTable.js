import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import { cellToAxiosParamsDelete, onDeleteSuccess } from "main/utils/studentsUtils"
import { useNavigate } from "react-router-dom";

export default function StudentsTable({ students }) {

    const navigate = useNavigate();

    const editCallback = (cell) => {
        navigate(`/admin/Students/edit/${cell.row.values.id}`)
    }

    // Stryker disable all : hard to test for query caching

    const deleteMutation = useBackendMutation(
        cellToAxiosParamsDelete,
        { onSuccess: onDeleteSuccess },
        ["/api/Students/all"]
    );
    // Stryker restore all 

    // Stryker disable next-line all : TODO try to make a good test for this
    const deleteCallback = async (cell) => { deleteMutation.mutate(cell); }


    const columns = [
        {
            Header: 'id',
            accessor: 'id', // accessor is the "key" in the data
        },
        {
            Header: 'Perm',
            accessor: 'perm',
        },
        {
            Header: 'Last Name',
            accessor: 'lastName',
        },
        {
            Header: 'First and Middle Name',
            accessor: 'firstMiddleName',
        },
        {
            Header: 'Course Id',
            accessor: 'courseId',
        },
        {
            Header: 'Email',
            accessor: 'email',
        }
    ];

    columns.push(ButtonColumn("Edit", "primary", editCallback, "StudentsTable"));
    columns.push(ButtonColumn("Delete", "danger", deleteCallback, "StudentsTable"));

    return <OurTable
        data={students}
        columns={columns}
        testid={"StudentsTable"}
    />;
};
