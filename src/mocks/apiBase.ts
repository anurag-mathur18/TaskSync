/** Must stay under Vite `base` so MSW can intercept on GitHub Pages. */
export const MOCK_API_BASE =
  (import.meta.env.VITE_API_BASE_URL || '/api/v1').replace(/\/$/, '') ||
  '/api/v1';
