import React from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { Row, Col } from "react-bootstrap";
import { useParams } from "react-router";
import { useBackend } from "main/utils/useBackend";
import ChatDisplay from "main/components/Chat/ChatDisplay";

export default function AdminChatPage() {
  const { commonsId } = useParams();

  // Stryker disable all
  const { data: commonsPlus } = useBackend(
    [`/api/commons/plus?id=${commonsId}`],
    {
      method: "GET",
      url: "/api/commons/plus",
      params: {
        id: commonsId,
      },
    },
  );
  // Stryker restore all

  const commonsName = commonsPlus?.commons.name;

  return (
    <BasicLayout>
      <div className="pt-2">
        <Row className="pt-5">
          <Col>
            <h2>Chat for Commons: {commonsName}</h2>
            <ChatDisplay commonsId={commonsId} />
          </Col>
        </Row>
      </div>
    </BasicLayout>
  );
}
