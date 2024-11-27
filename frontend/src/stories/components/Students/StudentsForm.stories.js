import React from 'react';
import StudentsForm from "main/components/Students/StudentsForm"
import { studentsFixtures } from "fixtures/studentsFixtures"

export default {
    title: 'components/Students/StudentsForm',
    component: StudentsForm,
};


const Template = (args) => {
    return (
        <StudentsForm {...args} />
    )
};

export const Create = Template.bind({});

Create.args = {
    buttonLabel: "Create",
    submitAction: (data) => {
        console.log("Submit was clicked with data: ", data); 
        window.alert("Submit was clicked with data: " + JSON.stringify(data));
   }
};

export const Update = Template.bind({});

Update.args = {
    initialContents: studentsFixtures.oneStudent,
    buttonLabel: "Update",
    submitAction: (data) => {
        console.log("Submit was clicked with data: ", data); 
        window.alert("Submit was clicked with data: " + JSON.stringify(data));
   }
};
