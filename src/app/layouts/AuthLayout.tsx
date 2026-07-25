import { RefreshCw } from 'lucide-react';
import { Outlet } from 'react-router';

/**
 * Centered auth chrome (login) — Design View 5 / login_desktop vibe.
 */
export function AuthLayout() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-md">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
        <div className="absolute -left-[10%] -top-[10%] h-[40%] w-[40%] rounded-full bg-primary-fixed opacity-20 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] h-[40%] w-[40%] rounded-full bg-secondary-container opacity-20 blur-[120px]" />
      </div>

      <main id="main-content" tabIndex={-1} className="relative z-10 w-full max-w-[440px] outline-none">
        <div className="mb-xl flex flex-col items-center">
          <div className="mb-md flex size-12 items-center justify-center rounded-lg bg-primary">
            <RefreshCw
              className="size-8 text-on-primary"
              aria-hidden
              strokeWidth={2}
            />
          </div>
          <h1 className="text-display tracking-tight text-on-surface">TaskSync</h1>
          <p className="mt-xs text-body-md text-on-surface-variant">
            Enterprise Intelligence Suite
          </p>
        </div>

        <Outlet />
      </main>
    </div>
  );
}
