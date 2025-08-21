import React from 'react';

import Plaintext from "main/components/Utils/Plaintext";

export default {
    title: 'components/Utils/Plaintext',
    component: Plaintext
};

const Template = (args) => {
    return (
        <Plaintext {...args} />
    )
};

export const Empty = Template.bind({});

Empty.args = {
    text: " "
};

export const ThreeLinesOfText = Template.bind({});

ThreeLinesOfText.args = {
    text: "foo\nbar\n\nbaz"
};