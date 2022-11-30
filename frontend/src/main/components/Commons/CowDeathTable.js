import React from "react";
import OurTable, {ButtonColumn} from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import { cellToAxiosParamsDelete, onDeleteSuccess } from "main/utils/commonsUtils"
//import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function CowDeathTable({ cowDeaths, currentUser }) {

    // Stryker disable all : hard to test for query caching
    const deleteMutation = useBackendMutation(
        cellToAxiosParamsDelete,
        { onSuccess: onDeleteSuccess },
        ["/api/cowdeath/all/bycommons"]
    );
    // Stryker enable all 

    // Stryker disable next-line all : TODO try to make a good test for this
    const deleteCallback = async (cell) => { 
        console.log("deleteCallback cell=", cell);
        deleteMutation.mutate(cell); 
    }

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
        ...columns,
        ButtonColumn("Delete", "danger", deleteCallback, testid)
    ];

    const columnsToDisplay = hasRole(currentUser, "ROLE_ADMIN") ? columnsIfAdmin : columns;

    return <OurTable
        data={cowDeaths}
        columns={columnsToDisplay}
        testid={testid}
    />;
}