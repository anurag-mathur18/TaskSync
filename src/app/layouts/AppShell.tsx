import { NavLink } from 'react-router';

import { RouteFadeOutlet } from '@/app/layouts/RouteFadeOutlet';
import { getVisibleNavItems } from '@/app/router/nav';
import { UserMenu, useSession } from '@/features/auth';
import { cn } from '@/shared/lib/cn';
import { Spinner } from '@/shared/ui/atoms/Spinner';

function navLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'flex min-h-11 items-center gap-md rounded-lg px-md py-sm text-label-md transition-all duration-150',
    'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    isActive
      ? 'bg-secondary-container text-on-secondary-container'
      : 'text-on-surface-variant hover:bg-surface-container-high',
  );
}

function mobileNavLinkClass({ isActive }: { isActive: boolean }): string {
  return cn(
    'flex min-h-11 min-w-11 flex-col items-center justify-center gap-xs rounded-full px-lg py-xs transition-all duration-150',
    'active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
    isActive
      ? 'bg-secondary-container text-on-secondary-container'
      : 'text-on-surface-variant hover:text-primary',
  );
}

/**
 * Authenticated chrome: 260px desktop sidebar, mobile bottom nav, outlet.
 */
export function AppShell() {
  const { user } = useSession();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" label="Loading workspace" />
      </div>
    );
  }

  const navItems = getVisibleNavItems(user.roles);

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-md focus:top-md focus:z-[60] focus:rounded-md focus:bg-primary focus:px-md focus:py-sm focus:text-on-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant bg-surface-container-lowest">
        <div className="flex w-full items-center justify-between px-margin-mobile py-md md:px-margin-desktop">
          <p className="text-headline-md font-semibold text-primary">
            TaskSync
          </p>

          <UserMenu />
        </div>
      </header>

      <div className="flex min-h-screen pt-[68px]">
        <aside
          className="fixed bottom-0 top-[68px] hidden w-[var(--sidebar-width)] flex-col border-r border-outline-variant bg-surface-container-lowest px-sm py-md md:flex"
        >
          <nav className="flex flex-col gap-xs" aria-label="Primary">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navLinkClass}>
                <Icon className="size-5 shrink-0" aria-hidden />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main
          id="main-content"
          tabIndex={-1}
          className="w-full flex-1 bg-background px-margin-mobile pb-24 pt-lg outline-none md:ml-[var(--sidebar-width)] md:px-margin-desktop md:pb-lg"
        >
          <div className="mx-auto w-full max-w-[var(--content-max-width)]">
            <RouteFadeOutlet />
          </div>
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-outline-variant bg-surface-container-lowest md:hidden"
        aria-label="Mobile"
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={mobileNavLinkClass}>
            <Icon className="size-5" aria-hidden />
            <span className="text-label-md">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
