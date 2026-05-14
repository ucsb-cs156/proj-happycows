import React, { useEffect, useRef } from "react";
import { Button, Spinner, Badge } from "react-bootstrap";
import { useParams, useNavigate } from "react-router";
import { useInfiniteQuery } from "react-query";
import axios from "axios";
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import { useBackend } from "main/utils/useBackend";

const PAGE_SIZE = 50;
const REFRESH_RATE = 5000;

const AdminChatPage = () => {
  const { commonsId } = useParams();
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);

  // Pull usernames for display (same approach as ChatHistoryPage)
  const { data: userCommonsList } = useBackend(
    [`/api/usercommons/commons/all?commonsId=${commonsId}`],
    {
      method: "GET",
      url: "/api/usercommons/commons/all",
      params: { commonsId: commonsId },
    },
    [],
    { enabled: !!commonsId }
  );

  const userIdToUsername = Array.isArray(userCommonsList)
    ? userCommonsList.reduce((acc, user) => {
        acc[user.userId] = user.username ?? "";
        return acc;
      }, {})
    : {};

  const fetchChatPage = async ({ pageParam = 0 }) => {
    const response = await axios.get("/api/chat/get", {
      params: {
        commonsId: commonsId,
        page: pageParam,
        size: PAGE_SIZE,
      },
    });
    return response.data;
  };

  const {
    data,
    status,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery(["adminChatHistory", commonsId], fetchChatPage, {
    getNextPageParam: (lastPage, pages) =>
      lastPage?.last === false ? pages.length : undefined,
    refetchInterval: REFRESH_RATE,
    enabled: !!commonsId,
  });

  useEffect(() => {
    if (!hasNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const messages = Array.isArray(data?.pages)
    ? data.pages.flatMap((page) => {
        if (!page || !Array.isArray(page.content)) return [];
        return page.content.map((message) => ({
          ...message,
          username: userIdToUsername[message.userId],
        }));
      })
    : [];

  const isInitialLoading = status === "loading";
  const showError = status === "error";

  return (
    <BasicLayout>
      <div className="pt-3" data-testid="AdminChatPage">
        <Button
          variant="secondary"
          className="mb-3"
          onClick={() => navigate(-1)}
          data-testid="AdminChatPage-back"
        >
          Back
        </Button>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Chat History</h2>
          <div className="text-muted">
            Commons #{commonsId}{" "}
            <Badge bg="secondary" className="ms-2">
              Admin read-only
            </Badge>
          </div>
        </div>

        <div
          style={{
            minHeight: "50vh",
            maxHeight: "70vh",
            overflowY: "auto",
            border: "1px solid #dee2e6",
            borderRadius: "0.5rem",
            padding: "1rem",
            backgroundColor: "white",
          }}
          data-testid="AdminChatPage-message-container"
        >
          {isInitialLoading && (
            <div className="text-center my-3">
              <Spinner animation="border" role="status" size="sm" /> Loading
              messages...
            </div>
          )}

          {showError && (
            <div className="text-center text-danger my-3">
              Unable to load chat messages.
            </div>
          )}

          {!isInitialLoading && messages.length === 0 && (
            <div className="text-center text-muted my-3">
              No messages available for this commons.
            </div>
          )}

          {messages.map((message) => (
            <ChatMessageDisplay key={message.id} message={message} />
          ))}

          <div
            ref={loadMoreRef}
            className="text-center text-muted mt-3"
            data-testid="AdminChatPage-status"
          >
            {isFetchingNextPage
              ? "Loading more messages..."
              : hasNextPage
              ? "Scroll to load more messages"
              : "[no more messages]"}
          </div>
        </div>

        {isFetching && !isFetchingNextPage && (
          <div className="text-center text-muted mt-2">
            Updating conversation...
          </div>
        )}
      </div>
    </BasicLayout>
  );
};

export default AdminChatPage;