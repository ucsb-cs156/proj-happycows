import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('index.html configuration', () => {
  const indexHtmlPath = path.join(__dirname, '../../../index.html');
  const indexHtmlContent = fs.readFileSync(indexHtmlPath, 'utf-8');

  it('should have the correct page title "HappyCows"', () => {
    expect(indexHtmlContent).toContain('<title>HappyCows</title>');
  });

  it('should have a favicon link element pointing to /favicon.ico', () => {
    expect(indexHtmlContent).toContain('rel="icon"');
    expect(indexHtmlContent).toContain('href="/favicon.ico"');
  });
});