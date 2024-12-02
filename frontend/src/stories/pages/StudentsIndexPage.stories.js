import React from 'react';
import StudentsIndexPage from "main/pages/StudentsIndexPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { rest } from 'msw';
import { studentsFixtures } from 'fixtures/studentsFixtures';

export default {
    title: 'pages/StudentsIndexPage',
    component: StudentsIndexPage,
};

export const Empty = () => {
    return (
       <StudentsIndexPage />
    )
}

Empty.parameters = {
    msw: [
        rest.get('/api/currentUser', (_req, res, ctx) => {
            return res(ctx.json(apiCurrentUserFixtures.adminUser));
        }),
        rest.get('/api/systemInfo', (_req, res, ctx) => {
            return res(ctx.json(systemInfoFixtures.showingNeither));
        }),
        rest.get('/api/Students/all', (_req, res, ctx) => {
            return res(ctx.json([]));
        }),
    ]
}

export const ThreeItemsAdminUser = () => {
    return (
       <StudentsIndexPage />
    )
}

ThreeItemsAdminUser.parameters = {
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
    ]
}