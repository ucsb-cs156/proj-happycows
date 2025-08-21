import React from 'react';
import LeaderboardPage from "main/pages/LeaderboardPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from 'msw';
import userCommonsFixtures from 'fixtures/userCommonsFixtures';
import commonsFixtures from 'fixtures/commonsFixtures';

export default {
    title: 'pages/LeaderboardPage',
    component: LeaderboardPage,
};

export const OrdinaryUserShowLeaderboardTrue = () => {
    return (<LeaderboardPage />)
}

OrdinaryUserShowLeaderboardTrue.parameters = {
    msw: [
        http.get('/api/currentUser', () => {
            return HttpResponse.json(apiCurrentUserFixtures.userOnly, { status: 200 });
        }),
        http.get('/api/systemInfo', () => {
            return HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 });
        }),
        http.get('/api/commons', () => {
            return HttpResponse.json(commonsFixtures.threeCommons[0], { status: 200 });
        }),
        http.get('/api/usercommons/commons/all', () => {
            return HttpResponse.json(userCommonsFixtures.tenUserCommons, { status: 200 });
        }),
    ]
}

export const OrdinaryUserShowLeaderboardFalse = () => {
    return (<LeaderboardPage />)
}

OrdinaryUserShowLeaderboardFalse.parameters = {
    msw: [
        http.get('/api/currentUser', () => {
            return HttpResponse.json(apiCurrentUserFixtures.userOnly, { status: 200 });
        }),
        http.get('/api/systemInfo', () => {
            return HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 });
        }),
        http.get('/api/commons', () => {
            return HttpResponse.json({ ...commonsFixtures.threeCommons[0], showLeaderboard: false }, { status: 200 });
        }),
        http.get('/api/usercommons/commons/all', () => {
            return HttpResponse.json(userCommonsFixtures.tenUserCommons, { status: 200 });
        }),
    ]
}

export const AdminUser = () => {
    return (
       <LeaderboardPage />
    )
}

AdminUser.parameters = {
    msw: [
        http.get('/api/currentUser', () => {
            return HttpResponse.json(apiCurrentUserFixtures.adminUser, { status: 200 });
        }),
        http.get('/api/systemInfo', () => {
            return HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 });
        }),
        http.get('/api/usercommons/commons/all', () => {
            return HttpResponse.json(userCommonsFixtures.tenUserCommons, { status: 200 });
        }),
        http.get('/api/commons', () => {
            return HttpResponse.json(commonsFixtures.threeCommons[0], { status: 200 });
        }),
    ]
}