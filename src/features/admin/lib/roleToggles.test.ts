import { describe, expect, it } from 'vitest';

import { nextRolesFromToggles } from '@/features/admin/lib/roleToggles';
import { Roles } from '@/shared-kernel';

describe('nextRolesFromToggles', () => {
  it('adds Employee when enabling Manager', () => {
    expect(
      nextRolesFromToggles([Roles.EMPLOYEE], {
        employee: true,
        manager: true,
      }),
    ).toEqual(
      expect.arrayContaining([Roles.EMPLOYEE, Roles.MANAGER]),
    );
  });

  it('preserves Admin when editing Employee/Manager', () => {
    const roles = nextRolesFromToggles([Roles.ADMIN], {
      employee: true,
      manager: false,
    });
    expect(roles).toContain(Roles.ADMIN);
    expect(roles).toContain(Roles.EMPLOYEE);
  });

  it('never returns an empty role set', () => {
    expect(
      nextRolesFromToggles([Roles.EMPLOYEE], {
        employee: false,
        manager: false,
      }),
    ).toEqual([Roles.EMPLOYEE]);
  });
});
