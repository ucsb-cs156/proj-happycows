
import React from 'react';

import Footer from "main/components/Nav/Footer";
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

export const definedSourceRepo = Template.bind({},
    { systemInfo: systemInfoFixtures.showingBoth,}
);

export const undefinedSourceRepo = Template.bind({}, {
    systemInfo: {
        ...systemInfoFixtures.showingBoth,
        sourceRepo: undefined,
    },
});