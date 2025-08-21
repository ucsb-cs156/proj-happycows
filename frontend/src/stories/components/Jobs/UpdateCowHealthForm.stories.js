import React from 'react';

import { action } from "storybook/actions";
import UpdateCowHealthForm from "main/components/Jobs/UpdateCowHealthForm";

export default {
    title: 'components/Jobs/UpdateCowHealthForm',
    component: UpdateCowHealthForm
};

const Template = (args) => {
    return (
        <UpdateCowHealthForm {...args} />
    )
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
    submitAction: action("submit")
};