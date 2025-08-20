import React from 'react';
import HomePage from "main/pages/HomePage";
import { http } from 'msw';
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

export default {
    title: 'pages/HomePage',
    component: HomePage,
};

export const normal = () => {
    return (<HomePage />)
}

normal.parameters = {
  msw: [
    http.get('/api/currentUser', (_req, res, ctx) => {
        return res(ctx.json(apiCurrentUserFixtures.userOnly));    
    }),
    http.get('/api/systemInfo', (_req, res, ctx) => {
      return res(ctx.json(systemInfoFixtures.showingNeither));
    }),
  ]
}

export const noUser = () => {
    return (<HomePage />)
}
noUser.parameters = {
  msw: [
    http.get('/api/systemInfo', (_req, res, ctx) => {
      return res(ctx.json(systemInfoFixtures.showingNeither));
    }),
  ]
}

export const userWithNoGivenName = () => {
  return (<HomePage />)
}
userWithNoGivenName.parameters = {
  msw: [
    http.get('/api/currentUser', (_req, res, ctx) => {
        return res(ctx.json(apiCurrentUserFixtures.userNoGivenName));
    }),
    http.get('/api/systemInfo', (_req, res, ctx) => {
      return res(ctx.json(systemInfoFixtures.showingNeither));
    }),
  ]
}

const Template = (args) => <HomePage  {...args} />;

export const Morning = Template.bind({});
Morning.args = {
  hour: 8
};

export const Day = Template.bind({});
Day.args = {
  hour: 10
};

export const Evening = Template.bind({});
Evening.args = {
  hour: 19
}

export const Night = Template.bind({});
Night.args = {
  hour: 2
}