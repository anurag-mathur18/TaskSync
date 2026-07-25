import { selectAccessToken } from '@/app/store/authSlice';
import { useAppSelector } from '@/app/store/hooks';
import { useGetMeQuery } from '@/features/auth/api/authApi';
import type { UserDto } from '@/shared-kernel';

export type SessionState = {
  user: UserDto | undefined;
  isAuthenticated: boolean;
  /** True while a token exists and `/auth/me` has not resolved yet. */
  isLoading: boolean;
};

/**
 * Session SSOT via RTK Query `getMe` + auth token slice — no Context.
 */
export function useSession(): SessionState {
  const accessToken = useAppSelector(selectAccessToken);
  const hasToken = Boolean(accessToken);

  const { data, isSuccess, isLoading, isFetching, isError } = useGetMeQuery(
    undefined,
    { skip: !hasToken },
  );

  if (!hasToken) {
    return { user: undefined, isAuthenticated: false, isLoading: false };
  }

  const awaitingMe =
    (isLoading || isFetching) && !isSuccess && !isError;

  return {
    user: data,
    isAuthenticated: isSuccess && Boolean(data),
    isLoading: awaitingMe,
  };
}
