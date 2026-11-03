// Frontend-only mock helpers. Replace individual service implementations with PHP REST calls later.
export const MOCK_REQUEST_DELAY = 180;

export function mockResponse(value, delay = MOCK_REQUEST_DELAY) {
  // JSON cloning keeps this mock layer compatible with browsers that do not support structuredClone.
  const copy = JSON.parse(JSON.stringify(value));
  return new Promise((resolve) => window.setTimeout(() => resolve(copy), delay));
}
