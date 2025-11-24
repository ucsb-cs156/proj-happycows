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
    http.get(/\/api\/chat\/get.*/, ({ request: _request }) => {
      return HttpResponse.json({ content: [], last: true });
    }),
    http.get(/\/api\/usercommons\/commons\/all.*/, () => {
      return HttpResponse.json([]);
    }),
  ],
};

export const OneMessage = Template.bind({});

OneMessage.args = {
  commonsId: 1,
};

OneMessage.parameters = {
  msw: [
    http.get(/\/api\/chat\/get.*/, ({ request: _request }) => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.oneChatMessage,
          last: true,
        },
        { status: 200 },
      );
    }),

    http.get(/\/api\/usercommons\/commons\/all.*/, () => {
      return HttpResponse.json(userCommonsFixtures.oneUserCommons);
    }),
  ],
};

export const ThreeMessages = Template.bind({});

ThreeMessages.args = {
  commonsId: 1,
};

ThreeMessages.parameters = {
  msw: [
    http.get(/\/api\/chat\/get.*/, ({ request: _request }) => {
      return HttpResponse.json(
        {
          content: chatMessageFixtures.threeChatMessages,
          last: true,
        },
        { status: 200 },
      );
    }),

    http.get(/\/api\/usercommons\/commons\/all.*/, () => {
      return HttpResponse.json(userCommonsFixtures.threeUserCommons);
    }),
  ],
};

// export const TwelveMessages = Template.bind({});

// TwelveMessages.args = {
//   commonsId: 1,
// };

// TwelveMessages.parameters = {
//   msw: [
//     http.get(/\/api\/chat\/get.*/, ({ request: _request }) => {
//       const url = new URL(_request.url);
//       const page = Number(url.searchParams.get("page")) || 0;
//       const size = Number(url.searchParams.get("size")) || 10;

//       const start = page * size;
//       const end = start + size;

//       const messages = chatMessageFixtures.twelveChatMessages.slice(start, end);
//       const last = end >= chatMessageFixtures.twelveChatMessages.length;

//       return HttpResponse.json({ content: messages, last });
//     }),

//     http.get(/\/api\/usercommons\/commons\/all.*/, () => {
//       return HttpResponse.json(userCommonsFixtures.tenUserCommons);
//     }),
//   ],
// };
