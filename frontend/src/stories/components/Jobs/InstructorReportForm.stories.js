import React from 'react';

import { action } from "storybook/actions";
import InstructorReportForm from "main/components/Jobs/InstructorReportForm";

export default {
    title: 'components/Jobs/InstructorReportForm',
    component: InstructorReportForm
};

const Template = (args) => {
    return (
        <InstructorReportForm {...args} />
    )
};

export const Uncontrolled = Template.bind({});

Uncontrolled.args = {
    submitAction: action("submit")
};