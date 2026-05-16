import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Ensure the spy exists before vi.mock factory runs (important for Stryker + hoisting)
const { ChatHistoryPageSpy } = vi.hoisted(() => ({
  ChatHistoryPageSpy: vi.fn(),
}));

// Mock ChatHistoryPage BEFORE importing AdminChatPage
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

  test("exports a component and renders", () => {
    expect(AdminChatPage).toBeDefined();

    renderPage();

    // Wrapper renders the mocked child (kills mutants that return null / don't render)
    expect(screen.getByTestId("ChatHistoryPageMock")).toBeInTheDocument();
    expect(ChatHistoryPageSpy).toHaveBeenCalledTimes(1);
  });

  test("passes readOnly=true exactly (kills boolean literal + removed prop mutants)", () => {
    renderPage();

    const props = ChatHistoryPageSpy.mock.calls[0][0];

    // Prop must exist
    expect(Object.prototype.hasOwnProperty.call(props, "readOnly")).toBe(true);

    // Must be strictly boolean true (not truthy, not string)
    expect(props.readOnly).toBe(true);
    expect(typeof props.readOnly).toBe("boolean");
  });

  test("passes only the expected props (kills extra/changed props mutants)", () => {
    renderPage();

    const props = ChatHistoryPageSpy.mock.calls[0][0];

    // Ensures wrapper doesn't start passing other props or remove readOnly
    expect(Object.keys(props)).toStrictEqual(["readOnly"]);
  });

  test("renders ChatHistoryPage exactly once per render (kills duplication mutants)", () => {
    renderPage();
    expect(ChatHistoryPageSpy).toHaveBeenCalledTimes(1);

    // Render again in same test to ensure counts track correctly
    renderPage();
    expect(ChatHistoryPageSpy).toHaveBeenCalledTimes(2);
  });
});
