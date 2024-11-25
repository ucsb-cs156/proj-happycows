import React from 'react';
import StudentsEditForm from "main/components/Students/StudentsEditForm"
import { studentsFixtures } from "fixtures/studentsFixtures"

export default {
    title: 'components/Students/StudentsEditForm',
    component: StudentsEditForm,
};


const Template = (args) => {
    return (
        <StudentsEditForm {...args} />
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
