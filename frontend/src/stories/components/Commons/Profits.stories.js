import React from 'react';

import Profits from "main/components/Commons/Profits";
import userCommonsFixtures from "fixtures/userCommonsFixtures"; 

export default {
    title: 'components/Commons/Profits',
    component: Profits
};

const Template = (args) => {
    return (
        <Profits {...args} />
    )
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
    userCommons: userCommonsFixtures.oneUserCommons[0]
};