import React from 'react';

import FarmStats from "main/components/Commons/FarmStats";
import userCommonsFixtures from "fixtures/userCommonsFixtures"; 

export default {
    title: 'components/Commons/FarmStats',
    component: FarmStats
};

const Template = (args) => {
    return (
        <FarmStats {...args} />
    )
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
    userCommons: userCommonsFixtures.oneUserCommons[0]
};