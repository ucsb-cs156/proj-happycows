import React from 'react';

import CommonsPlay from "main/components/Commons/CommonsPlay";
import {currentUserFixtures} from "fixtures/currentUserFixtures"; 

export default {
    title: 'components/Commons/CommonsPlay',
    component: CommonsPlay
};

const Template = (args) => {
    return (
        <CommonsPlay {...args} />
    )
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
    currentUser: currentUserFixtures.adminUser
};