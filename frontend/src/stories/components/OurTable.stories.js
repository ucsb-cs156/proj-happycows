import React from 'react';
import OurTable from 'main/components/OurTable';

export default {
    title: 'components/OurTable',
    component: OurTable
};

const Template = (args) => {
    return (
        <OurTable {...args} />
    )
};

export const SmallTableTest = Template.bind({});

SmallTableTest.args = {
    columns: [
        {
            Header: 'Column 1',
            accessor: 'col1', // accessor is the "key" in the data
        },
        {
            Header: 'Column 2',
            accessor: 'col2',
        },
    ],
    data: [
        {
            col1: 'Hello',
            col2: 'World',
        },
        {
            col1: 'react-table',
            col2: 'rocks',
        },
        {
            col1: 'whatever',
            col2: 'you want',
        },
    ]
};

// create a table with 5 columns and 20 rows
export const LargeTableTest = Template.bind({});

LargeTableTest.args = {
    columns: [
        {
            Header: 'Number',
            accessor: 'num', // accessor is the "key" in the data
        },
        {
            Header: 'Next',
            accessor: 'next',
        },
        {
            Header: 'Prev',
            accessor: 'prev',
        },
        {
            Header: 'Double',
            accessor: 'double',
        },
        {
            Header: 'Square',
            accessor: 'square',
        },
    ],
    data: [...Array(20).keys()].map((i) => { // list containing [0, 19]
        return {
            num: i,
            next: i+1,
            prev: i-1,
            double: i*2,
            square: i*i
        }
    }) 
};


// create a table with 5 columns, 100 rows and page size 5
export const PagesizeTest = Template.bind({});

PagesizeTest.args = {
    columns: [
        {
            Header: 'Number',
            accessor: 'num', // accessor is the "key" in the data
        },
        {
            Header: 'Next',
            accessor: 'next',
        },
        {
            Header: 'Prev',
            accessor: 'prev',
        },
        {
            Header: 'Double',
            accessor: 'double',
        },
        {
            Header: 'Square',
            accessor: 'square',
        },
    ],
    data: [...Array(100).keys()].map((i) => { // list containing [0, 19]
        return {
            num: i,
            next: i+1,
            prev: i-1,
            double: i*2,
            square: i*i
        }
    }),
    pageSize: 5
};