import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import { useLogoutMutation } from '@/features/auth/api/authApi';

/**
 * POST logout → credentials + RTK Query cache cleared in mutation → `/login`.
 */
export function useLogout() {
  const navigate = useNavigate();
  const [logoutMutation, meta] = useLogoutMutation();

  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Local session already cleared in mutation `finally`.
    } finally {
      void navigate('/login', { replace: true });
    }
  }, [logoutMutation, navigate]);

  return [logout, meta] as const;
}
