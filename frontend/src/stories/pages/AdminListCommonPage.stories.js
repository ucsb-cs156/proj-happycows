import React from 'react';
import AdminListCommonPage from "main/pages/AdminListCommonPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http } from 'msw';
import commonsPlusFixtures from 'fixtures/commonsPlusFixtures';

export default {
    title: 'pages/AdminListCommonPage',
    component: AdminListCommonPage
};

export const adminListPage = () => <AdminListCommonPage />;

adminListPage.parameters = {
    msw: [
        http.get('/api/currentUser', (_req, res, ctx) => {
            return res(ctx.json(apiCurrentUserFixtures.adminUser));
        }),
        http.get('/api/systemInfo', (_req, res, ctx) => {
            return res(ctx.json(systemInfoFixtures.showingNeither));
        }),
        http.get('/api/commons/allplus', (_req, res, ctx) => {
            return res(ctx.json(commonsPlusFixtures.threeCommonsPlus));
        }),
    ]
}