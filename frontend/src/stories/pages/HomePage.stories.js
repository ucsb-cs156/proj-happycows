import React from 'react';
import HomePage from "main/pages/HomePage";
import { http, HttpResponse } from 'msw';
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
    http.get('/api/currentUser', () => {
        return HttpResponse.json(apiCurrentUserFixtures.userOnly, { status: 200 });    
    }),
    http.get('/api/systemInfo', () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 });
    }),
  ]
}

export const noUser = () => {
    return (<HomePage />)
}
noUser.parameters = {
  msw: [
    http.get('/api/systemInfo', () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 });
    }),
  ]
}

export const userWithNoGivenName = () => {
  return (<HomePage />)
}
userWithNoGivenName.parameters = {
  msw: [
    http.get('/api/currentUser', () => {
        return HttpResponse.json(apiCurrentUserFixtures.userNoGivenName, { status: 200 });
    }),
    http.get('/api/systemInfo', () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 });
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