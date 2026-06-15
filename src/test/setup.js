import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Automatically clean up the virtual DOM after each test case to prevent pollution
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock browser localStorage for stateful simulations (e.g. JWT tokens and Mock DB persistence)
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn(key => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn(key => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock the global Fetch API so that unit and integration tests do not make actual network requests
global.fetch = vi.fn();
