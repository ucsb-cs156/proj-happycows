import React from "react";
import { http, HttpResponse } from "msw";

import ChatPanel from "main/components/Chat/ChatPanel";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";
import userCommonsFixtures from "fixtures/userCommonsFixtures";

export default {
  title: "components/Chat/ChatPanel",
  component: ChatPanel,
};

const Template = (args) => {
  return <ChatPanel {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  commonsId: 1,
};

Empty.parameters = {
  msw: [
    /* eslint-disable-next-line no-unused-vars */
    http.get("/api/chat/get?page=0&size=10&commonsId=1", () => {
      return HttpResponse.json([], { status: 200 });
    }),
    /* eslint-disable-next-line no-unused-vars */
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
    /* eslint-disable-next-line no-unused-vars */
    http.get("/api/chat/get?page=0&size=10&commonsId=1", () => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.oneChatMessage,
          totalPages: 1,
        },
        { status: 200 },
      );
    }),
    /* eslint-disable-next-line no-unused-vars */
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
    /* eslint-disable-next-line no-unused-vars */
    http.get("/api/chat/get?page=0&size=10&commonsId=1", () => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.threeChatMessages,
          totalPages: 1,
        },
        { status: 200 },
      );
    }),
    /* eslint-disable-next-line no-unused-vars */
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
    /* eslint-disable-next-line no-unused-vars */
    http.get("/api/chat/get?page=0&size=10&commonsId=1", () => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.twelveChatMessages,
          totalPages: 2,
        },
        { status: 200 },
      );
    }),
    /* eslint-disable-next-line no-unused-vars */
    http.get("/api/usercommons/all?commonsId=1", () => {
      return HttpResponse.json(userCommonsFixtures.tenUserCommons, {
        status: 200,
      });
    }),
  ],
};
