// Set VITE_API_BASE_URL when the PHP REST API is available. No network requests are made yet.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const MOCK_REQUEST_DELAY = 180;

export function mockResponse(value, delay = MOCK_REQUEST_DELAY) {
  return new Promise((resolve) => window.setTimeout(() => resolve(structuredClone(value)), delay));
}
