import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UsersTable from "main/components/Users/UsersTable"
import { useCurrentUser } from "main/utils/currentUser";

import { useUsers } from "main/utils/users";
const AdminUsersPage = () => {

    const { data: users } = useUsers();
    const { data: currentUser } = useCurrentUser();

    return (
        <BasicLayout>
            <h2>Users</h2>
            <UsersTable users={users} currentUser={currentUser} />
        </BasicLayout>
    );
};

export default AdminUsersPage;
