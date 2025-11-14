import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("index.html configuration", () => {
  const indexHtmlPath = join(__dirname, "../../../index.html");
  const indexHtmlContent = readFileSync(indexHtmlPath, "utf-8");

  it('should have the correct page title "HappyCows"', () => {
    expect(indexHtmlContent).toContain("<title>HappyCows</title>");
  });

  it("should have a favicon link element pointing to /favicon.ico", () => {
    expect(indexHtmlContent).toContain('rel="icon"');
    expect(indexHtmlContent).toContain('href="/favicon.ico"');
  });
});
