import React from "react";

import ReportTable from "main/components/Reports/ReportTable";
import reportFixtures from "fixtures/reportFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/Reports/ReportTable",
  component: ReportTable,
};

const Template = (args) => {
  return <ReportTable storybook={true} {...args} />;
};

export const ThreeReports = Template.bind({});

ThreeReports.args = {
  reports: reportFixtures.threeReports,
};

ThreeReports.parameters = {
  msw: [
    http.delete("/api/reports", ({ request }) => {
      window.alert("DELETE: " + JSON.stringify(request.url));
      return HttpResponse.json({ message: "Report deleted" }, { status: 200 });
    }),
    http.delete("/api/reports/purge", ({ request }) => {
      window.alert("DELETE: " + JSON.stringify(request.url));
      return HttpResponse.json(
        { message: "Purged older reports" },
        { status: 200 },
      );
    }),
  ],
};
