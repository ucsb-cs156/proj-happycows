import React from 'react';
import StudentsEditPage from "main/pages/StudentsEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { rest } from 'msw';
import { studentsFixtures } from 'fixtures/studentsFixtures';

export default {
    title: 'pages/StudentsEditPage',
    component: StudentsEditPage,
};

export const Default = () => {
    return (
       <StudentsEditPage />
    )
}

Default.parameters = {
    msw: [
        rest.get('/api/currentUser', (_req, res, ctx) => {
            return res(ctx.json(apiCurrentUserFixtures.adminUser));
        }),
        rest.get('/api/systemInfo', (_req, res, ctx) => {
            return res(ctx.json(systemInfoFixtures.showingNeither));
        }),
        rest.get('/api/Students/all', (_req, res, ctx) => {
            return res(ctx.json(studentsFixtures.threeStudents));
        }),
        rest.get('/api/Students/all', (_req, res, ctx) => {
            return res(ctx.json({}, { status: 200 }));
        }),
    ]
}