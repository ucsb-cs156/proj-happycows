import React from 'react';

import CommonsOverview from "main/components/Commons/CommonsOverview";
import commonsPlusFixtures from "fixtures/commonsPlusFixtures";

export default {
    title: 'components/Commons/CommonsOverview',
    component: CommonsOverview
};

const Template = (args) => {
    return (
        <CommonsOverview {...args} />
    )
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
    commonsPlus: commonsPlusFixtures.oneCommonsPlus[0]
};