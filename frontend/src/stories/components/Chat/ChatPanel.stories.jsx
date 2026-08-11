import React from "react";
import { http, HttpResponse } from "msw";

import ChatPanel from "main/components/Chat/ChatPanel";
import { chatMessageFixtures } from "fixtures/chatMessageFixtures";
import farmerFixtures from "fixtures/farmerFixtures";

export default {
  title: "components/Chat/ChatPanel",
  component: ChatPanel,
};

const Template = (args) => {
  return <ChatPanel {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  gameId: 1,
};

Empty.parameters = {
  msw: [
    http.get("/api/chat/get?page=0&size=10&gameId=1", () => {
      return HttpResponse.json(
        {
          content: [],
          totalPages: 1,
        },
        { status: 200 },
      );
    }),

    http.get("/api/farmer/all?gameId=1", () => {
      return HttpResponse.json([], { status: 200 });
    }),
  ],
};

export const OneMessage = Template.bind({});

OneMessage.args = {
  gameId: 1,
};

OneMessage.parameters = {
  msw: [
    http.get("/api/chat/get?page=0&size=10&gameId=1", () => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.oneChatMessage,
          totalPages: 1,
        },
        { status: 200 },
      );
    }),

    http.get("/api/farmer/all?gameId=1", () => {
      return HttpResponse.json(farmerFixtures.oneFarmer, {
        status: 200,
      });
    }),
  ],
};

export const ThreeMessages = Template.bind({});

ThreeMessages.args = {
  gameId: 1,
};

ThreeMessages.parameters = {
  msw: [
    http.get("/api/chat/get?page=0&size=10&gameId=1", () => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.threeChatMessages,
          totalPages: 1,
        },
        { status: 200 },
      );
    }),

    http.get("/api/farmer/all?gameId=1", () => {
      return HttpResponse.json(farmerFixtures.threeFarmer, {
        status: 200,
      });
    }),
  ],
};

export const TwelveMessages = Template.bind({});

TwelveMessages.args = {
  gameId: 1,
};

TwelveMessages.parameters = {
  msw: [
    http.get("/api/chat/get?page=0&size=10&gameId=1", () => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.twelveChatMessages,
          totalPages: 2,
        },
        { status: 200 },
      );
    }),

    http.get("/api/farmer/all?gameId=1", () => {
      return HttpResponse.json(farmerFixtures.tenFarmer, {
        status: 200,
      });
    }),
  ],
};
