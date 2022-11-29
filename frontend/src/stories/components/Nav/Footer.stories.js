
import React from 'react';

import Footer from "main/components/Nav/Footer";
//import { currentUserFixtures } from 'fixtures/currentUserFixtures';
import { systemInfoFixtures } from 'fixtures/systemInfoFixtures';

export default {
    title: 'components/Nav/Footer',
    component: Footer
};


const Template = (args) => {
    return (
        <Footer {...args} />
    )
};

export const basic_noRepo = Template.bind({});

export const basic_withRepo = Template.bind({});
basic_withRepo.args = {
    systemInfo: systemInfoFixtures.showingBoth
};