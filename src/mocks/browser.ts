import { setupWorker } from 'msw/browser';

import { handlers } from '@/mocks/handlers';

export const worker = setupWorker(...handlers);

export async function startMockWorker(): Promise<void> {
  await worker.start({
    onUnhandledRequest: 'bypass',
    quiet: true,
    // Must match Vite `base` so the worker loads under /TaskSync/ on GitHub Pages.
    serviceWorker: {
      url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
    },
  });
}
