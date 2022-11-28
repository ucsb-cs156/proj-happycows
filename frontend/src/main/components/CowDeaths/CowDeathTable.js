import OurTable from "main/components/OurTable";
import { hasRole } from "main/utils/currentUser";

// should take in a players list from a commons
export default function CowDeathTable({ cowDeaths , currentUser }) {

    const columns = [
        {
            Header: 'Commons Id',
            accessor: 'commonsId',
        },
        {
            Header: 'User Id',
            accessor: 'userId', 
        },
				{
            Header: 'Zone Date Time',
            accessor: 'ZonedDateTime', 
        },
				{
            Header: 'Cows Killed',
            accessor: 'cowsKilled', 
        },
				{
            Header: 'Average Health',
            accessor: 'avgHealth', 
        },
    ];

    const testid = "CowDeathTable";

    /* Temp filler for admin CowDeath table */

    const columnsIfAdmin = [
        {
            Header: '(Admin) Id',
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

};
