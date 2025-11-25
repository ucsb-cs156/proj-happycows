import React, { useState } from "react";
import { Container, Card, Form, Button } from "react-bootstrap";
import { useParams } from "react-router";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import ChatMessageCreate from "main/components/Chat/ChatMessageCreate";
import { useBackend } from "main/utils/useBackend";

export default function ChatPage() {
  const { commonsId } = useParams();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // Stryker disable all
  const refreshRate = 2000;

  const { data: messagesPage, isLoading: messagesLoading } = useBackend(
    [`/api/chat/get`, commonsId, currentPage, pageSize],
    {
      method: "GET",
      url: `/api/chat/get`,
      params: {
        commonsId: commonsId,
        page: currentPage,
        size: pageSize,
      },
    },
    { content: [], totalPages: 0, totalElements: 0 },
    { refetchInterval: refreshRate }
  );

  const { data: userCommonsList } = useBackend(
    [`/api/usercommons/commons/all`],
    {
      method: "GET",
      url: "/api/usercommons/commons/all",
      params: {
        commonsId: commonsId,
      },
    },
    [],
    { refetchInterval: refreshRate },
  );

  // Stryker restore all

  const sortedMessages = messagesPage.content.sort((a, b) => b.id - a.id);
  const totalPages = messagesPage.totalPages || 0;
  const totalElements = messagesPage.totalElements || 0;

  const userIdToUsername = userCommonsList.reduce((acc, user) => {
    acc[user.userId] = user.username;
    return acc;
  }, {});

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(0); // reset to first page when page size changes
  };

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  return (
    <BasicLayout>
      <Container data-testid="ChatPage">
        <div className="mb-3">
          <Form.Label>Messages per page:</Form.Label>
          <Form.Select
            value={pageSize}
            onChange={handlePageSizeChange}
            data-testid="page-size-selector"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>
          <small className="text-muted" data-testid="page-info">
            Page {currentPage + 1} of {totalPages === 0 ? 1 : totalPages}{" "}
            (Total: {totalElements} messages)
          </small>
        </div>

        <Card className="mb-3">
          <Card.Body>
            <ChatMessageCreate commonsId={commonsId} />
          </Card.Body>
        </Card>

        {!messagesLoading && sortedMessages.length === 0 && (
          <Card className="text-center py-5">
            <Card.Body>
              <p className="text-muted" data-testid="no-messages">
                No messages found.
              </p>
            </Card.Body>
          </Card>
        )}

        {!messagesLoading && sortedMessages.length > 0 && (
          <div data-testid="message-list">
            {sortedMessages.map((message) => (
              <div key={message.id} className="mb-2">
                <ChatMessageDisplay
                  message={{
                    ...message,
                    username: userIdToUsername[message.userId],
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="d-flex justify-content-center align-items-center gap-3 mt-4 mb-4">
            <Button
              onClick={() => handlePageChange(0)}
              disabled={!canGoPrevious}
              data-testid="pagination-first"
            >
              First
            </Button>
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!canGoPrevious}
              data-testid="pagination-prev"
            >
              Previous
            </Button>
            <span data-testid="pagination-info">
              Page {currentPage + 1} of {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!canGoNext}
              data-testid="pagination-next"
            >
              Next
            </Button>
            <Button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={!canGoNext}
              data-testid="pagination-last"
            >
              Last
            </Button>
          </div>
        )}
      </Container>
    </BasicLayout>
  );
}
