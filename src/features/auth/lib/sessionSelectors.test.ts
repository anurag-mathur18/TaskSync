import { describe, expect, it } from 'vitest';

import { setupStore } from '@/app/store';
import { setCredentials } from '@/app/store/authSlice';
import { authApi } from '@/features/auth/api/authApi';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectSessionHomePath,
} from '@/features/auth/lib/sessionSelectors';
import { Roles, type UserDto } from '@/shared-kernel';

const adminUser: UserDto = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'admin@tasksync.local',
  fullName: 'Ada Admin',
  roles: [Roles.ADMIN],
  managerId: null,
  orgId: '00000000-0000-4000-8000-000000000001',
};

describe('sessionSelectors', () => {
  it('reads user from getMe cache and derives home path', async () => {
    const store = setupStore();
    store.dispatch(setCredentials({ accessToken: 'test-token' }));
    await store.dispatch(
      authApi.util.upsertQueryData('getMe', undefined, adminUser),
    );

    const state = store.getState();
    expect(selectCurrentUser(state)).toEqual(adminUser);
    expect(selectIsAuthenticated(state)).toBe(true);
    expect(selectSessionHomePath(state)).toBe('/admin');
  });

  it('treats missing me cache as unauthenticated for selectors', () => {
    const store = setupStore();
    expect(selectIsAuthenticated(store.getState())).toBe(false);
    expect(selectSessionHomePath(store.getState())).toBe('/login');
  });
});
