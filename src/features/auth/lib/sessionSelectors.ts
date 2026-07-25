import { authApi } from '@/features/auth/api/authApi';
import type { RootState } from '@/app/store';
import { getHomePath } from '@/shared/lib/roles';
import type { UserDto } from '@/shared-kernel';

/** Current user from RTK Query `getMe` cache (session SSOT). */
export function selectCurrentUser(state: RootState): UserDto | undefined {
  return authApi.endpoints.getMe.select(undefined)(state).data;
}

export function selectIsAuthenticated(state: RootState): boolean {
  return Boolean(state.auth.accessToken && selectCurrentUser(state));
}

export function selectSessionHomePath(state: RootState): string {
  const user = selectCurrentUser(state);
  return user ? getHomePath(user.roles) : '/login';
}
