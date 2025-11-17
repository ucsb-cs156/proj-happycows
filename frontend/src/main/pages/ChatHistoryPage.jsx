import React, { useEffect, useMemo, useRef } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router";
import { useInfiniteQuery } from "react-query";
import axios from "axios";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import ChatMessageCreate from "main/components/Chat/ChatMessageCreate";
import { useBackend } from "main/utils/useBackend";

const PAGE_SIZE = 25;
const REFRESH_RATE = 2000;

const ChatHistoryPage = () => {
  const { commonsId } = useParams();
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);

  // Stryker disable all
  const { data: userCommonsList } = useBackend(
    [`/api/usercommons/commons/all?commonsId=${commonsId}`],
    {
      method: "GET",
      url: "/api/usercommons/commons/all",
      params: {
        commonsId: commonsId,
      },
    },
    [],
    { refetchInterval: REFRESH_RATE, enabled: !!commonsId },
  );
  // Stryker restore all

  const userIdToUsername = useMemo(() => {
    return userCommonsList.reduce((acc, user) => {
      acc[user.userId] = user.username || "";
      return acc;
    }, {});
  }, [userCommonsList]);

  const fetchChatPage = async ({ pageParam = 0 }) => {
    const response = await axios("/api/chat/get", {
      method: "GET",
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
  } = useInfiniteQuery(
    ["chatHistory", commonsId],
    fetchChatPage,
    {
      getNextPageParam: (lastPage, pages) =>
        lastPage?.last === false ? pages.length : undefined,
      refetchInterval: REFRESH_RATE,
      enabled: !!commonsId,
    },
  );

  useEffect(() => {
    if (!hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 1.0,
      },
    );

    const currentRef = loadMoreRef.current;

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const messages =
    data?.pages.flatMap((page) =>
      page.content.map((message) => ({
        ...message,
        username: userIdToUsername[message.userId],
      })),
    ) ?? [];

  const isInitialLoading = status === "loading";
  const showError = status === "error";

  return (
    <BasicLayout>
      <div className="pt-3" data-testid="ChatHistoryPage">
        <Button
          variant="secondary"
          className="mb-3"
          onClick={() => navigate(-1)}
          data-testid="ChatHistoryPage-back"
        >
          Back
        </Button>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Chat History</h2>
          <span className="text-muted">Commons #{commonsId}</span>
        </div>
        <div className="mb-4">
          <ChatMessageCreate commonsId={commonsId} />
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
          data-testid="ChatHistoryPage-message-container"
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
            data-testid="ChatHistoryPage-status"
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

export default ChatHistoryPage;
