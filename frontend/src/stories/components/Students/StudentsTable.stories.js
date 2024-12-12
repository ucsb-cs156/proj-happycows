import React from 'react';
import StudentsTable from "main/components/Students/StudentsTable";
import { studentsFixtures } from 'fixtures/studentsFixtures';
import { currentUserFixtures } from 'fixtures/currentUserFixtures';
import { rest } from "msw";

export default {
    title: 'components/Students/StudentsTable',
    component: StudentsTable
};

const Template = (args) => {
    return (
        <StudentsTable {...args} />
    )
};

export const Empty = Template.bind({});

Empty.args = {
    students: []
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.args = {
    students: studentsFixtures.threeStudents,
    currentUser: currentUserFixtures.userOnly,
};

export const ThreeItemsAdminUser = Template.bind({});
ThreeItemsAdminUser.args = {
    students: studentsFixtures.threeStudents,
    currentUser: currentUserFixtures.adminUser,
}

ThreeItemsAdminUser.parameters = {
    msw: [
        rest.delete('/api/Students', (req, res, ctx) => {
            window.alert("DELETE: " + JSON.stringify(req.url));
            return res(ctx.status(200),ctx.json({}));
        }),
    ]
};

