import React from 'react';

import { action } from "storybook/actions";
import CommonsForm from "main/components/Commons/CommonsForm";

export default {
    title: 'components/Commons/CommonsForm',
    component: CommonsForm
};

const Template = (args) => {
    return (
        <CommonsForm {...args} />
    )
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
    submitAction: action("submit")
};