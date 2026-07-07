import React from "react";
import TimeSeries from "main/components/Utils/TimeSeries";

export default {
  title: "components/Utils/TimeSeries",
  component: TimeSeries,
};

const Template = (args) => <TimeSeries {...args} />;

export const SingleSeries = Template.bind({});
SingleSeries.args = {
  data: [
    {
      name: "Wealth",
      color: "#0088FE",
      values: [
        { date: "2024-01-01T00:00:00.000Z", value: 2 },
        { date: "2024-01-02T00:00:00.000Z", value: 5 },
        { date: "2024-01-03T00:00:00.000Z", value: 4 },
      ],
    },
  ],
};

export const MultipleSeries = Template.bind({});
MultipleSeries.args = {
  data: [
    {
      name: "Wealth",
      color: "#0088FE",
      values: [
        { date: "2024-01-01T00:00:00.000Z", value: 2 },
        { date: "2024-01-02T00:00:00.000Z", value: 5 },
        { date: "2024-01-03T00:00:00.000Z", value: 4 },
      ],
    },
    {
      name: "Population",
      color: "#FF8042",
      values: [
        { date: "2024-01-01T00:00:00.000Z", value: 8 },
        { date: "2024-01-02T00:00:00.000Z", value: 6 },
        { date: "2024-01-03T00:00:00.000Z", value: 7 },
      ],
    },
  ],
};

export const DifferentColors = Template.bind({});
DifferentColors.args = {
  data: [
    {
      name: "A",
      color: "#FF0000",
      values: [
        { date: "2024-01-01T00:00:00.000Z", value: 1 },
        { date: "2024-01-02T00:00:00.000Z", value: 3 },
      ],
    },
    {
      name: "B",
      color: "#00AA00",
      values: [
        { date: "2024-01-01T00:00:00.000Z", value: 4 },
        { date: "2024-01-02T00:00:00.000Z", value: 2 },
      ],
    },
    {
      name: "C",
      color: "#0000FF",
      values: [
        { date: "2024-01-01T00:00:00.000Z", value: 5 },
        { date: "2024-01-02T00:00:00.000Z", value: 6 },
      ],
    },
  ],
};

export const AllToggleable = Template.bind({});
AllToggleable.args = {
  ...DifferentColors.args,
  selectors: "all",
};

export const PercentageSeries = Template.bind({});
PercentageSeries.args = {
  data: [
    {
      name: "Health",
      color: "#00AA00",
      percentage: true,
      values: [
        { date: "2024-01-01T00:00:00.000Z", value: 15 },
        { date: "2024-01-02T00:00:00.000Z", value: 45 },
        { date: "2024-01-03T00:00:00.000Z", value: 90 },
      ],
    },
  ],
};

export const MixedStandardAndPercentage = Template.bind({});
MixedStandardAndPercentage.args = {
  data: [
    {
      name: "Wealth",
      color: "#0088FE",
      values: [
        { date: "2024-01-01T00:00:00.000Z", value: 2 },
        { date: "2024-01-02T00:00:00.000Z", value: 5 },
        { date: "2024-01-03T00:00:00.000Z", value: 4 },
      ],
    },
    {
      name: "Health",
      color: "#00AA00",
      percentage: true,
      values: [
        { date: "2024-01-01T00:00:00.000Z", value: 25 },
        { date: "2024-01-02T00:00:00.000Z", value: 50 },
        { date: "2024-01-03T00:00:00.000Z", value: 75 },
      ],
    },
  ],
};

export const JustOneToggleable = Template.bind({});
JustOneToggleable.args = {
  ...MixedStandardAndPercentage.args,
  selectors: ["Wealth"],
};
