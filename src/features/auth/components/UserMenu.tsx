import { LogOut } from 'lucide-react';

import { useLogout } from '@/features/auth/hooks/useLogout';
import { useSession } from '@/features/auth/hooks/useSession';
import { Button } from '@/shared/ui/atoms/Button';

/**
 * Header user identity + logout (AppShell).
 */
export function UserMenu() {
  const { user } = useSession();
  const [logout, { isLoading }] = useLogout();

  if (!user) return null;

  return (
    <div className="flex items-center gap-md">
      <div className="hidden text-right sm:block">
        <p className="text-body-md font-medium text-on-surface">{user.fullName}</p>
        <p className="text-body-sm text-on-surface-variant">{user.email}</p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        isLoading={isLoading}
        onClick={() => {
          void logout();
        }}
        aria-label="Log out"
        className="min-h-11 min-w-11"
      >
        <LogOut className="size-4" aria-hidden />
        <span className="hidden sm:inline">Log out</span>
      </Button>
    </div>
  );
}
