import React from "react";
import { http, HttpResponse } from "msw";

import ChatDisplay from "main/components/Chat/ChatDisplay";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";
import userCommonsFixtures from "fixtures/userCommonsFixtures";

export default {
  title: "components/Chat/ChatDisplay",
  component: ChatDisplay,
};

const Template = (args) => {
  return <ChatDisplay {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  commonsId: 1,
};

Empty.parameters = {
  msw: [
    http.get("/api/chat/get?page=0&size=10&commonsId=1", () => {
      return HttpResponse.json({ content: [] }, { status: 200 });
    }),

    http.get("/api/usercommons/all?commonsId=1", () => {
      return HttpResponse.json([], { status: 200 });
    }),
  ],
};

export const OneMessage = Template.bind({});

OneMessage.args = {
  commonsId: 1,
};

OneMessage.parameters = {
  msw: [
    http.get("/api/chat/get?page=0&size=10&commonsId=1", () => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.oneChatMessage,
          totalPages: 1,
        },
        { status: 200 },
      );
    }),

    http.get("/api/usercommons/all?commonsId=1", () => {
      return HttpResponse.json(userCommonsFixtures.oneUserCommons, {
        status: 200,
      });
    }),
  ],
};

export const ThreeMessages = Template.bind({});

ThreeMessages.args = {
  commonsId: 1,
};

ThreeMessages.parameters = {
  msw: [
    http.get("/api/chat/get?page=0&size=10&commonsId=1", () => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.threeChatMessages,
          totalPages: 1,
        },
        { status: 200 },
      );
    }),

    http.get("/api/usercommons/all?commonsId=1", () => {
      return HttpResponse.json(userCommonsFixtures.threeUserCommons, {
        status: 200,
      });
    }),
  ],
};

export const TwelveMessages = Template.bind({});

TwelveMessages.args = {
  commonsId: 1,
};

TwelveMessages.parameters = {
  msw: [
    http.get("/api/chat/get?page=0&size=10&commonsId=1", () => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.twelveChatMessages,
          totalPages: 2,
        },
        { status: 200 },
      );
    }),

    http.get("/api/usercommons/all?commonsId=1", () => {
      return HttpResponse.json(userCommonsFixtures.tenUserCommons, {
        status: 200,
      });
    }),
  ],
};
