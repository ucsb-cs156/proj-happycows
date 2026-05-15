import React, { useEffect, useRef } from "react";
import { Button, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router";
import { useInfiniteQuery } from "react-query";
import axios from "axios";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import ChatMessageDisplay from "main/components/Chat/ChatMessageDisplay";
import ChatMessageCreate from "main/components/Chat/ChatMessageCreate";
import { useBackendMutation } from "main/utils/useBackend";
import { useBackend } from "main/utils/useBackend";

const PAGE_SIZE = 25;
const REFRESH_RATE = 2000;

const ChatHistoryPage = ({ readOnly = false, isAdmin = false }) => {
  const { commonsId } = useParams();
  const navigate = useNavigate();
  const loadMoreRef = useRef(null);

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

  const hasValidUserCommons = Array.isArray(userCommonsList);
  const userIdToUsername = hasValidUserCommons
    ? userCommonsList.reduce((acc, user) => {
        acc[user.userId] = user.username || "";
        return acc;
      }, {})
    : {};

  const deleteMutation = useBackendMutation(
    (id) => ({
      url: "/api/chat/hide",
      method: "PUT",
      params: { chatMessageId: id },
    }),
    {
      onSuccess: () => {
        // React Query will refetch automatically if keys match
      },
    },
    [`/api/chat/admin/get?commonsId=${commonsId}`], // IMPORTANT
  );

  const handleDelete = (id) => {
    if (window.confirm("Delete this message?")) {
      deleteMutation.mutate(id);
    }
  };

  const fetchChatPage = async ({ pageParam = 0 }) => {
    const response = await axios.get(
      isAdmin ? "/api/chat/admin/get" : "/api/chat/get",
      {
        params: {
          commonsId,
          page: pageParam,
          size: PAGE_SIZE,
        },
      },
    );
    return response.data;
  };

  const {
    data,
    status,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
  } = useInfiniteQuery(["chatHistory", commonsId], fetchChatPage, {
    getNextPageParam: (lastPage, pages) =>
      lastPage?.last === false ? pages.length : undefined,
    refetchInterval: REFRESH_RATE,
    enabled: !!commonsId,
  });

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
    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const messages = Array.isArray(data?.pages)
    ? data.pages.flatMap((page) => {
        if (!page || !Array.isArray(page.content)) {
          return [];
        }
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
          <span className="text-muted">
            Commons #{commonsId} {readOnly && "• Admin Read Only"}
          </span>
          <span className="text-muted">Commons #{commonsId}</span>
        </div>

        {!readOnly && (
          <div className="mb-4">
            <ChatMessageCreate commonsId={commonsId} />
          </div>
        )}

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
            <div
              key={message.id}
              className="d-flex justify-content-between align-items-start mb-2"
            >
              <div
                style={
                  message.hidden ? { opacity: 0.5, fontStyle: "italic" } : {}
                }
              >
                <ChatMessageDisplay message={message} />
              </div>

              {isAdmin && (
                <button
                  className="btn btn-danger btn-sm ms-2"
                  data-testid={`ChatHistoryPage-delete-${message.id}`}
                  onClick={() => handleDelete(message.id)}
                >
                  Delete
                </button>
              )}
            </div>
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
