import React from 'react';

import CowDeathTable from "main/components/CowDeaths/CowDeathTable";
import cowDeathFixtures from 'fixtures/cowDeathFixtures';
import { currentUserFixtures } from 'fixtures/currentUserFixtures';

export default {
    title: 'components/CowDeaths/CowDeathTable',
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

export const OneUserCommons = Template.bind({});

OneUserCommons.args = {
    cowDeaths: cowDeathFixtures.oneUserCommonsCD
};

export const ThreeUserCommons = Template.bind({});

ThreeUserCommons.args = {
    cowDeaths: cowDeathFixtures.threeUserCommonsCD
};

export const ThreeUserCommonsAdmin = Template.bind({});

ThreeUserCommonsAdmin.args = {
    cowDeaths: cowDeathFixtures.threeUserCommonsCD,
    currentUser: currentUserFixtures.adminUser

};

export const FiveUserCommons = Template.bind({});

FiveUserCommons.args = {
    cowDeaths: cowDeathFixtures.fiveUserCommonsCD
};


export const FiveUserCommonsAdmin = Template.bind({});

FiveUserCommonsAdmin.args = {
    cowDeaths: cowDeathFixtures.fiveUserCommonsCD,
    currentUser: currentUserFixtures.adminUser
};

export const TenUserCommons = Template.bind({});

TenUserCommons.args = {
    cowDeaths: cowDeathFixtures.tenUserCommonsCD
};


