import React from "react";
import CountHistogram from "main/components/Utils/CountHistogram";

export default {
  title: "components/Utils/CountHistogram",
  component: CountHistogram,
};

const Template = (args) => <CountHistogram {...args} />;

export const Empty = Template.bind({});
Empty.args = {
  data: [],
  s: 10,
};

export const SimpleBinSize10 = Template.bind({});
SimpleBinSize10.args = {
  data: [1, 5, 10, 15, 20, 25, 30],
  s: 10,
};

export const BinSize5 = Template.bind({});
BinSize5.args = {
  data: [0, 2, 4, 5, 7, 10, 12, 15, 18, 20],
  s: 5,
};

export const LargeBinSize = Template.bind({});
LargeBinSize.args = {
  data: [5, 15, 25, 35, 45, 55, 65, 75, 85, 95],
  s: 50,
};

export const SkewedDistribution = Template.bind({});
SkewedDistribution.args = {
  data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 50, 51, 52],
  s: 10,
};

export const UniformDistribution = Template.bind({});
UniformDistribution.args = {
  data: Array.from({ length: 30 }, () => Math.floor(Math.random() * 100)),
  s: 10,
};

export const SmallValues = Template.bind({});
SmallValues.args = {
  data: [0, 0, 1, 1, 2, 3],
  s: 1,
};

export const CustomDimensions = Template.bind({});
CustomDimensions.args = {
  data: [5, 15, 25, 35, 45],
  s: 10,
  width: 800,
  height: 500,
};

export const HighlySkewed = Template.bind({});
HighlySkewed.args = {
  data: [0, 1, 2, 3, 4, 5, 100],
  s: 10,
};
