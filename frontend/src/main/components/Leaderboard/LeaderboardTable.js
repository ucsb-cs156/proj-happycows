import OurTable from "main/components/OurTable";
import { hasRole } from "main/utils/currentUser";

// should take in a players list from a commons
export default function LeaderboardTable({ leaderboardUsers , currentUser }) {

    const columns = [
        {
            Header: 'User Id',
            accessor: 'userCommons.userId', 
        },
        {
            Header: 'Username',
            accessor: 'username',
        },
        {
            Header: 'Total Wealth',
            accessor: 'userCommons.totalWealth',
        },
        {
            Header: 'Cows Owned',
            accessor: 'userCommons.numOfCows', 
        },
    ];

    const testid = "LeaderboardTable";

    /* Temp filler for admin leaderboard table */

    const columnsIfAdmin = [
        {
            Header: '(Admin) userCommons Id',
            accessor: 'userCommons.id'
        },
        ...columns

    ];

    const columnsToDisplay = hasRole(currentUser, "ROLE_ADMIN") ? columnsIfAdmin : columns;

    return <OurTable
        data={leaderboardUsers}
        columns={columnsToDisplay}
        testid={testid}
    />;

};