import React from 'react';
import AdminListCommonPage from "main/pages/AdminListCommonPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from 'msw';
import commonsPlusFixtures from 'fixtures/commonsPlusFixtures';

export default {
    title: 'pages/AdminListCommonPage',
    component: AdminListCommonPage
};

export const adminListPage = () => <AdminListCommonPage />;

adminListPage.parameters = {
    msw: [
        http.get('/api/currentUser', () => {
            return HttpResponse.json(apiCurrentUserFixtures.adminUser, { status: 200 });
        }),
        http.get('/api/systemInfo', () => {
            return HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 });
        }),
        http.get('/api/commons/allplus', () => {
            return HttpResponse.json(commonsPlusFixtures.threeCommonsPlus, { status: 200 });
        }),
    ]
}