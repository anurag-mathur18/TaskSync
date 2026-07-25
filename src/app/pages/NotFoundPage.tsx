import { Link } from 'react-router';

export function NotFoundPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-md bg-background px-margin-mobile">
      <p className="text-label-md uppercase tracking-wider text-outline">404</p>
      <h1 className="text-headline-lg text-on-surface">Page not found</h1>
      <p className="max-w-sm text-center text-body-md text-on-surface-variant">
        That route does not exist. Head back to your home workspace.
      </p>
      <Link
        to="/"
        className="mt-sm rounded-md bg-primary px-4 py-2 text-body-md font-medium text-on-primary transition-transform duration-150 hover:bg-primary-container active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        Go home
      </Link>
    </main>
  );
}
