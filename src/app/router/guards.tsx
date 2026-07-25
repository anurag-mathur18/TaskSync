import { useEffect, useRef, type ReactNode } from 'react';
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router';

import { buildLoginPath, sanitizeReturnUrl } from '@/app/router/returnUrl';
import { useSession } from '@/features/auth/hooks/useSession';
import {
  canAccessAdmin,
  canAccessTasks,
  canAccessTeam,
  getHomePath,
  hasAnyRole,
} from '@/shared/lib/roles';
import { Spinner } from '@/shared/ui/atoms/Spinner';
import { toast } from '@/shared/ui/organisms';
import type { Role } from '@/shared-kernel';

function GuardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner size="md" label="Checking session" />
    </div>
  );
}

function useAccessDeniedToast(shouldToast: boolean) {
  const toasted = useRef(false);

  useEffect(() => {
    if (!shouldToast || toasted.current) return;
    toasted.current = true;
    toast.error('Access denied', { id: 'access-denied' });
  }, [shouldToast]);
}

/** Valid session required; otherwise `/login?returnUrl=…`. */
export function RequireAuth() {
  const location = useLocation();
  const { isAuthenticated, isLoading } = useSession();

  if (isLoading) return <GuardLoading />;

  if (!isAuthenticated) {
    const returnUrl = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={buildLoginPath(returnUrl)} replace />;
  }

  return <Outlet />;
}

/** Guests only; authenticated users go to role home. */
export function RequireGuest() {
  const { user, isAuthenticated, isLoading } = useSession();
  const [searchParams] = useSearchParams();

  if (isLoading) return <GuardLoading />;

  if (isAuthenticated && user) {
    const safeReturn = sanitizeReturnUrl(searchParams.get('returnUrl'));
    const dest = safeReturn ?? getHomePath(user.roles);
    return <Navigate to={dest} replace />;
  }

  return <Outlet />;
}

type RequireRoleProps = {
  roles: readonly Role[];
  children?: ReactNode;
};

/** User must have at least one of `roles`; else home + toast. */
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, isAuthenticated, isLoading } = useSession();
  const allowed =
    isAuthenticated && user ? hasAnyRole(user.roles, roles) : false;

  useAccessDeniedToast(
    Boolean(isAuthenticated && user && !isLoading && !allowed),
  );

  if (isLoading) return <GuardLoading />;
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (!allowed) {
    return <Navigate to={getHomePath(user.roles)} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}

export function RequireManager() {
  const { user, isLoading } = useSession();
  const allowed = user ? canAccessTeam(user.roles) : false;

  useAccessDeniedToast(Boolean(user && !isLoading && !allowed));

  if (isLoading) return <GuardLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed) {
    return <Navigate to={getHomePath(user.roles)} replace />;
  }

  return <Outlet />;
}

export function RequireAdmin() {
  const { user, isLoading } = useSession();
  const allowed = user ? canAccessAdmin(user.roles) : false;

  useAccessDeniedToast(Boolean(user && !isLoading && !allowed));

  if (isLoading) return <GuardLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed) {
    return <Navigate to={getHomePath(user.roles)} replace />;
  }

  return <Outlet />;
}

/** EMPLOYEE or MANAGER — Admin-only users are sent to `/admin`. */
export function RequireTaskAccess() {
  const { user, isLoading } = useSession();
  const allowed = user ? canAccessTasks(user.roles) : false;

  useAccessDeniedToast(Boolean(user && !isLoading && !allowed));

  if (isLoading) return <GuardLoading />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed) {
    return <Navigate to={getHomePath(user.roles)} replace />;
  }

  return <Outlet />;
}

/** `/` → role home (`/tasks` or `/admin` for Admin-only). */
export function HomeRedirect() {
  const { user, isLoading } = useSession();

  if (isLoading) return <GuardLoading />;
  if (!user) return <Navigate to="/login" replace />;

  return <Navigate to={getHomePath(user.roles)} replace />;
}
