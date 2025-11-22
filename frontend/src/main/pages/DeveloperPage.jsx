import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useSystemInfo } from "main/utils/systemInfo";
import { Inspector } from "react-inspector";

const DeveloperPage = () => {
  const { data: systemInfo } = useSystemInfo();

  return (
    <BasicLayout>
      <h2>Developer Info</h2>
      <p>
        <strong>Source Code: </strong>
        <a
          href={systemInfo?.sourceRepo}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="developer-page-source-link"
        >
          {systemInfo?.sourceRepo}
        </a>
      </p>
      <h3>System Information</h3>
      <div data-testid="developer-page-system-info">
        <Inspector data={systemInfo} />
      </div>
    </BasicLayout>
  );
};

export default DeveloperPage;
