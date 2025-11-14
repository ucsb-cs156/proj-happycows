import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Inspector } from "react-inspector";
import { useSystemInfo } from "main/utils/systemInfo";

const DeveloperPage = () => {
    const { data: systemInfo } = useSystemInfo();

    return (
    <BasicLayout>
        <h2>Developer Info</h2>
        <p>This page is only visible to admin users.</p>

        {systemInfo && (
        <>
            <h3>GitHub Repository</h3>
            <p>
            <a
                href={systemInfo.sourceRepo}
                target="_blank"
                rel="noreferrer"
            >
                {systemInfo.sourceRepo}
            </a>
            </p>

            <h3>System Info (JSON)</h3>
            <Inspector data={systemInfo} />
        </>
        )}
    </BasicLayout>
    );
};

export default DeveloperPage;
