import React, { useState } from "react";
import BinSizeSelector from "main/components/Utils/BinSizeSelector";

export default {
  title: "components/Utils/BinSizeSelector",
  component: BinSizeSelector,
};

const Template = (args) => {
  const [value, setValue] = useState(args.value ?? 10);
  return <BinSizeSelector {...args} value={value} onChange={setValue} />;
};

export const Default = Template.bind({});
Default.args = {
  value: 10,
};

export const SmallBinSize = Template.bind({});
SmallBinSize.args = {
  value: 1,
};

export const LargeBinSize = Template.bind({});
LargeBinSize.args = {
  value: 50,
};
