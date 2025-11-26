import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const indexHtml = fs.readFileSync(
  path.join(__dirname, "..", "..", "index.html"),
  "utf-8",
);

describe("frontend/index.html metadata", () => {
  test("document.title is HappyCows", () => {
    const doc = new DOMParser().parseFromString(indexHtml, "text/html");
    expect(doc.title).toBe("HappyCows");
  });
});
