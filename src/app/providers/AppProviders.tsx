import type { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { RouterProvider, type RouterProviderProps } from 'react-router';

import { router as defaultRouter } from '@/app/router';
import { store as defaultStore } from '@/app/store';
import { Toaster } from '@/shared/ui/organisms/Toaster';

type AppProvidersProps = {
  children?: ReactNode;
  store?: typeof defaultStore;
  router?: RouterProviderProps['router'];
};

/**
 * Root providers: Redux store + React Router only — never Context for domain.
 */
export function AppProviders({
  children,
  store = defaultStore,
  router = defaultRouter,
}: AppProvidersProps) {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster />
      {children}
    </Provider>
  );
}
