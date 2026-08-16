import React from "react";

import AdminReportsPage from "main/pages/AdminReportsPage";
import reportFixtures from "fixtures/reportFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "pages/AdminReportsPage",
  component: AdminReportsPage,
};

const Template = () => <AdminReportsPage />;

export const Default = Template.bind({});

Default.parameters = {
  msw: [
    http.get("/api/reports", () => {
      return HttpResponse.json(reportFixtures.sixReports, { status: 200 });
    }),
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
