import React, { useEffect, useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AdminCommonsCard from "main/components/Commons/AdminCommonsCard";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";
import {
  getFocusTargetId,
  scrollToFocusTarget,
} from "main/utils/focusScrollUtils";
import { Button, Row, Col, Container, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router";

export default function AdminListCommonsPageV2() {
  const { data: currentUser } = useCurrentUser();
  const location = useLocation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  // Stryker disable  all
  const {
    data: commons,
    error: _error,
    status: _status,
    isFetching,
  } = useBackend(
    ["/api/commons/allplus"],
    { method: "GET", url: "/api/commons/allplus" },
    [],
  );
  // Stryker restore  all

  const sortedCommons = [...commons].sort(
    (a, b) => b.commons.id - a.commons.id,
  );

  const filteredCommons = sortedCommons.filter((c) =>
    c.commons.name.toLowerCase().includes(query.toLowerCase()),
  );

  const focusId = getFocusTargetId(location.search);

  useEffect(() => {
    // Wait until the (re)fetch settles so we scroll against the final layout,
    // then remove ?focus= from the URL so later data updates don't re-scroll.
    if (!focusId || isFetching || commons.length === 0) {
      return;
    }
    scrollToFocusTarget({ targetId: focusId });
    navigate(location.pathname, { replace: true });
  }, [focusId, isFetching, commons, navigate, location.pathname]);

  // Stryker disable all - styles that don't need to be mut tested
  const DownloadButtonStyle = {
    display: "flex",
    justifyContent: "flex-end",
  };
  // Stryker restore all

  return (
    <BasicLayout>
      <div className="pt-2">
        <Row className="pt-5 page-header align-items-center">
          <Col md={3}>
            <h2 style={{ margin: 0 }}>Commons</h2>
          </Col>
          <Col md={6}>
            <div className="search-container">
              <Form.Control
                type="text"
                placeholder="Search by name..."
                value={query}
                onChange={handleQueryChange}
                data-testid="AdminListCommonsPage-Search"
                className="search-input"
              />
              <span className="search-icon-wrapper">🔍</span>
            </div>
          </Col>
          <Col md={3} style={DownloadButtonStyle}>
            <Button
              href="/api/commonstats/downloadAll"
              variant="outline-success"
              style={{ borderRadius: "30px", padding: "10px 20px" }}
            >
              Download All Stats
            </Button>
          </Col>
        </Row>
        <Container
          fluid
          className="pt-3"
          style={{ animation: "fadeInDown 1s ease-out" }}
        >
          {filteredCommons &&
            filteredCommons.map((common) => (
              <div key={common.commons.id} id={String(common.commons.id)}>
                <AdminCommonsCard
                  commonItem={common}
                  currentUser={currentUser}
                />
              </div>
            ))}
        </Container>
      </div>
    </BasicLayout>
  );
}
