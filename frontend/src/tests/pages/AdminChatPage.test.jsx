import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import "@testing-library/jest-dom";
import { vi } from "vitest";

const { ChatHistoryPageSpy } = vi.hoisted(() => ({
  ChatHistoryPageSpy: vi.fn(),
}));

vi.mock("main/pages/ChatHistoryPage", () => ({
  __esModule: true,
  default: (props) => {
    ChatHistoryPageSpy(props);
    return <div data-testid="ChatHistoryPageMock">Mocked ChatHistoryPage</div>;
  },
}));

import AdminChatPage from "main/pages/AdminChatPage";

describe("AdminChatPage tests (coverage + Stryker)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPage = () =>
    render(
      <MemoryRouter>
        <AdminChatPage />
      </MemoryRouter>,
    );

  test("renders component and child", () => {
    expect(AdminChatPage).toBeDefined();

    renderPage();

    expect(screen.getByTestId("ChatHistoryPageMock")).toBeInTheDocument();
    expect(ChatHistoryPageSpy).toHaveBeenCalledTimes(1);
  });

  test("passes readOnly=true correctly", () => {
    renderPage();

    const props = ChatHistoryPageSpy.mock.calls[0][0];

    expect(Object.prototype.hasOwnProperty.call(props, "readOnly")).toBe(true);
    expect(props.readOnly).toBe(true);
    expect(typeof props.readOnly).toBe("boolean");
  });

  test("passes isAdmin=true correctly", () => {
    renderPage();

    const props = ChatHistoryPageSpy.mock.calls[0][0];

    expect(Object.prototype.hasOwnProperty.call(props, "isAdmin")).toBe(true);
    expect(props.isAdmin).toBe(true);
    expect(typeof props.isAdmin).toBe("boolean");
  });

  test("passes exactly the expected props (strict check for Stryker)", () => {
    renderPage();

    const props = ChatHistoryPageSpy.mock.calls[0][0];

    expect(Object.keys(props)).toStrictEqual(["readOnly", "isAdmin"]);
  });

  test("renders exactly once per render", () => {
    renderPage();
    expect(ChatHistoryPageSpy).toHaveBeenCalledTimes(1);

    renderPage();
    expect(ChatHistoryPageSpy).toHaveBeenCalledTimes(2);
  });
});
