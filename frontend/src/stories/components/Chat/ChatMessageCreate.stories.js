import React from 'react';
import { http, HttpResponse } from 'msw';
import ChatMessageCreate from "main/components/Chat/ChatMessageCreate";

export default {
    title: 'components/Chat/ChatMessageCreate',
    component: ChatMessageCreate
};

const Template = (args) => {
    return (
        <ChatMessageCreate {...args} />
    )
};

export const Message = Template.bind({});

Message.args = {
    commonsId: 1,
};

Message.parameters = {
    msw: [
        http.post('/api/chat/post', ({ request }) => {
            window.alert("POST: " + JSON.stringify(request.url));
            return HttpResponse.json({}, { status: 200 });
        }),
    ]
};