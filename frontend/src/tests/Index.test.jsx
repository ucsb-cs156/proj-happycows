import { describe, it, expect } from "vitest";

beforeEach(() => {
  document.body.innerHTML = `
    <div id="root"></div>
  `;
  document.title = "HappyCows";
});

describe("index.html title", () => {
  it("has the correct document title", () => {
    expect(document.title).toBe("HappyCows");
  });

  it("favicon link is correct", () => {
     document.head.innerHTML = `
    <link rel="icon" href="/favicon.ico" />
  `;

  const link = document.querySelector('link[rel="icon"]');
  expect(link.getAttribute("href")).toBe("/favicon.ico");
  });
});