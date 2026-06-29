import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Automatically clean up the virtual DOM after each test case to prevent pollution
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock the global Fetch API so that unit and integration tests do not make actual network requests
global.fetch = vi.fn();
