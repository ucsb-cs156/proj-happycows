import {
    ButtonColumn,
    DateColumn,
    PlaintextColumn,
} from "main/components/OurTable";

const clickMeCallback = () => { window.alert("Placeholder Callback Called!"); };

const ourTableFixtures = {
    columns: [
        {
            Header: "Column 1",
            accessor: "col1", // accessor is the "key" in the data
        },
        {
            Header: "Column 2",
            accessor: "col2",
        },
        ButtonColumn("Click", "primary", clickMeCallback, "testId"),
        DateColumn("Date", (cell) => cell.row.original.createdAt),
        PlaintextColumn("Log", (cell) => cell.row.original.log),
    ],
    threeRows: [
        {
            col1: "Hello",
            col2: "World",
            createdAt: "2021-04-01T04:00:00.000",
            log: "foo\nbar\n  baz",
        },
        {
            col1: "react-table",
            col2: "rocks",
            createdAt: "2022-01-04T14:00:00.000",
            log: "foo\nbar",
        },
        {
            col1: "whatever",
            col2: "you want",
            createdAt: "2023-04-01T23:00:00.000",
            log: "bar\n  baz",
        },
    ],
    tenRows: [],
    elevenRows: [],
    thirtyRows: [],
    hundredRows: [],
};

for (let i = 0; i < 10; i++) {
    ourTableFixtures.tenRows.push({
        col1: `Hello ${i}`,
        col2: `World ${i}`,
        createdAt: `2021-04-01T04:00:00.000`,
        log: `foo\nbar\n  baz ${i}`,
    });
}

for (let i = 0; i < 11; i++) {
    ourTableFixtures.elevenRows.push({
        col1: `Hello ${i}`,
        col2: `World ${i}`,
        createdAt: `2021-04-01T04:00:00.000`,
        log: `foo\nbar\n  baz ${i}`,
    });
}

for (let i = 0; i < 30; i++) {
    ourTableFixtures.thirtyRows.push({
        col1: `Hello ${i}`,
        col2: `World ${i}`,
        createdAt: `2021-04-01T04:00:00.000`,
        log: `foo\nbar\n  baz ${i}`,
    });
}

for (let i = 0; i < 100; i++) {
    ourTableFixtures.hundredRows.push({
        col1: `Hello ${i}`,
        col2: `World ${i}`,
        createdAt: `2021-04-01T04:00:00.000`,
        log: `foo\nbar\n  baz ${i}`,
    });
}

export default ourTableFixtures;
