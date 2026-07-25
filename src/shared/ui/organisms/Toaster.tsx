import { Toaster as SonnerToaster } from 'sonner';

/**
 * App-level toast host (sonner). Mount once under the React tree — no Context.
 */
export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'border border-outline-variant bg-surface-container-lowest text-on-surface shadow-modal',
          title: 'text-body-md font-medium',
          description: 'text-body-sm text-on-surface-variant',
        },
      }}
    />
  );
}
