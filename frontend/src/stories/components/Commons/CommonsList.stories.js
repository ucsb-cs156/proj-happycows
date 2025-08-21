import React from 'react';

import commonsFixtures from "fixtures/commonsFixtures"; 
import CommonsList from "main/components/Commons/CommonsList";

export default {
    title: 'components/Commons/CommonsList',
    component: CommonsList
};

const Template = (args) => {
    return (
        <CommonsList {...args} />
    )
};

export const NullButton = Template.bind({});

NullButton.args = {
    commonList: commonsFixtures.threeCommons,
    buttonText: null
};

export const TextButton = Template.bind({});

TextButton.args = {
    commonList: commonsFixtures.threeCommons,
    buttonText: "Join"
};