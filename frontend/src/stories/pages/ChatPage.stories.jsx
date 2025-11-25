import React from "react";
import ChatPage from "main/pages/ChatPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";
import userCommonsFixtures from "fixtures/userCommonsFixtures";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";

export default {
  title: "pages/ChatPage",
  component: ChatPage,
};

const Template = () => <ChatPage />;

export const Empty = Template.bind({});
Empty.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/usercommons/commons/all", () => {
      return HttpResponse.json(userCommonsFixtures.threeUserCommons, {
        status: 200,
      });
    }),
    http.get("/api/chat/get", () => {
      return HttpResponse.json(
        { content: [], totalPages: 0, totalElements: 0 },
        { status: 200 },
      );
    }),
  ],
};

export const ThreeMessages = Template.bind({});
ThreeMessages.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/usercommons/commons/all", () => {
      return HttpResponse.json(userCommonsFixtures.threeUserCommons, {
        status: 200,
      });
    }),
    http.get("/api/chat/get", () => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.threeChatMessages,
          totalPages: 1,
          totalElements: 3,
        },
        { status: 200 },
      );
    }),
  ],
};

export const ManyMessages = Template.bind({});
ManyMessages.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/usercommons/commons/all", () => {
      return HttpResponse.json(userCommonsFixtures.threeUserCommons, {
        status: 200,
      });
    }),
    http.get("/api/chat/get", () => {
      const manyMessages = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        userId: 1,
        commonsId: 1,
        message: `This is message number ${i + 1}`,
        timestamp: "2023-08-18T00:00:00",
      }));
      return HttpResponse.json(
        { content: manyMessages, totalPages: 5, totalElements: 50 },
        { status: 200 },
      );
    }),
  ],
};
