import React from 'react';
import LeaderboardPage from "main/pages/LeaderboardPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http } from 'msw';
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
        http.get('/api/currentUser', (_req, res, ctx) => {
            return res(ctx.json(apiCurrentUserFixtures.userOnly));
        }),
        http.get('/api/systemInfo', (_req, res, ctx) => {
            return res(ctx.json(systemInfoFixtures.showingNeither));
        }),
        http.get('/api/commons', (_req, res, ctx) => {
            return res(ctx.json(commonsFixtures.threeCommons[0]));
        }),
        http.get('/api/usercommons/commons/all', (_req, res, ctx) => {
            return res(ctx.json(userCommonsFixtures.tenUserCommons));
        }),
    ]
}

export const OrdinaryUserShowLeaderboardFalse = () => {
    return (<LeaderboardPage />)
}

OrdinaryUserShowLeaderboardFalse.parameters = {
    msw: [
        http.get('/api/currentUser', (_req, res, ctx) => {
            return res(ctx.json(apiCurrentUserFixtures.userOnly));
        }),
        http.get('/api/systemInfo', (_req, res, ctx) => {
            return res(ctx.json(systemInfoFixtures.showingNeither));
        }),
        http.get('/api/commons', (_req, res, ctx) => {
            return res(ctx.json({...commonsFixtures.threeCommons[0], showLeaderboard: false}));
        }),
        http.get('/api/usercommons/commons/all', (_req, res, ctx) => {
            return res(ctx.json(userCommonsFixtures.tenUserCommons));
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
        http.get('/api/currentUser', (_req, res, ctx) => {
            return res(ctx.json(apiCurrentUserFixtures.adminUser));
        }),
        http.get('/api/systemInfo', (_req, res, ctx) => {
            return res(ctx.json(systemInfoFixtures.showingNeither));
        }),
        http.get('/api/usercommons/commons/all', (_req, res, ctx) => {
            return res(ctx.json(userCommonsFixtures.tenUserCommons));
        }),
        http.get('/api/commons', (_req, res, ctx) => {
            return res(ctx.json(commonsFixtures.threeCommons[0]));
        }),
    ]
}