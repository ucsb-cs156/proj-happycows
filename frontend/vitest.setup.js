// vitest.setup.js
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Jest global for compatibility with existing tests
global.jest = vi;