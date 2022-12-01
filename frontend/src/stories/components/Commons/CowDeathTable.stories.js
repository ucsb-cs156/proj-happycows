import React from 'react';

import CowDeathTable from "main/components/Commons/CowDeathTable";
import cowDeathFixtures from 'fixtures/cowDeathFixtures';
import { currentUserFixtures } from 'fixtures/currentUserFixtures';

export default {
    title: 'components/commons/CowDeathTable',
    component: CowDeathTable
};

const Template = (args) => {
    return (
        <CowDeathTable {...args} />
    )
};

export const Empty = Template.bind({});

Empty.args = {
    cowDeaths: []
};

export const ThreeCowDeaths = Template.bind({});

ThreeCowDeaths.args = {
    cowDeaths: cowDeathFixtures.threecowdeaths
};

export const OneCowDeath = Template.bind({});

OneCowDeath.args = {
    cowDeaths: cowDeathFixtures.onecowdeath
}

export const ThreeCowDeathsAdmin = Template.bind({});

ThreeCowDeathsAdmin.args = {
    cowDeaths: cowDeathFixtures.threecowdeaths,
    currentUser: currentUserFixtures.adminUser
};

export const OneCowDeathAdmin = Template.bind({});

OneCowDeathAdmin.args = {
    cowDeaths: cowDeathFixtures.onecowdeath,
    currentUser: currentUserFixtures.adminUser
}