import React, { useEffect, useRef, useState } from "react";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import AdminCommonsCard from "main/components/Commons/AdminCommonsCard";
import { useBackend } from "main/utils/useBackend";
import { useCurrentUser } from "main/utils/currentUser";
import {
  getHashTargetId,
  HASH_SCROLL_INTO_VIEW_OPTIONS,
  shouldScrollToHash,
} from "main/utils/hashScrollUtils";
import { Button, Row, Col, Container, Form } from "react-bootstrap";
import { useLocation } from "react-router";

export default function AdminListCommonsPageV2() {
  const { data: currentUser } = useCurrentUser();
  const location = useLocation();
  // Stryker disable next-line ObjectLiteral
  const lastScrolledRef = useRef({
    hash: null,
    locationKey: null,
  });
  // Stryker restore all

  const [query, setQuery] = useState("");

  const handleQueryChange = (event) => {
    setQuery(event.target.value);
  };

  // Stryker disable  all
  const {
    data: commons,
    error: _error,
    status: _status,
  } = useBackend(
    ["/api/commons/allplus"],
    { method: "GET", url: "/api/commons/allplus" },
    [],
  );
  // Stryker restore  all

  const filteredCommons = commons.filter((c) =>
    c.commons.name.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    if (
      !shouldScrollToHash({
        hash: location.hash,
        commonsLength: commons.length,
        locationKey: location.key,
        lastScrolledHash: lastScrolledRef.current.hash,
        lastScrolledLocationKey: lastScrolledRef.current.locationKey,
      })
    )
      return;

    const element = document.getElementById(getHashTargetId(location.hash));
    if (element) {
      element.scrollIntoView(HASH_SCROLL_INTO_VIEW_OPTIONS);
      lastScrolledRef.current = {
        hash: location.hash,
        locationKey: location.key,
      };
    }
  }, [location.hash, location.key, commons]);

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
