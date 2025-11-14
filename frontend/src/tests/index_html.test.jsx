import fs from "fs";
import path from "path";

beforeAll(() => {
  // Load the real index.html into JSDOM
  const filePath = path.resolve("index.html");
  const html = fs.readFileSync(filePath, "utf-8");
  document.documentElement.innerHTML = html;
});

//checks for title
describe("index.html metadata", () => {
  it("sets the correct document title", () => {
    expect(document.title).toBe("HappyCows");
  });

  //checks of favicon
  it("has the correct favicon", () => {
    const icon = document.querySelector("link[rel~='icon']");
    expect(icon).not.toBeNull();
    expect(icon.getAttribute("href")).toBe("/public/favicon.ico");
  });
});
