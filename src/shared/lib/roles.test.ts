import { describe, expect, it } from 'vitest';

import { getVisibleNavItems } from '@/app/router/nav';
import {
  canAccessAdmin,
  canAccessTasks,
  canAccessTeam,
  getHomePath,
  isAdminOnly,
} from '@/shared/lib/roles';
import { Roles } from '@/shared-kernel';

describe('role access helpers', () => {
  it('classifies Admin-only users', () => {
    expect(isAdminOnly([Roles.ADMIN])).toBe(true);
    expect(isAdminOnly([Roles.ADMIN, Roles.EMPLOYEE])).toBe(false);
    expect(getHomePath([Roles.ADMIN])).toBe('/admin');
    expect(getHomePath([Roles.MANAGER, Roles.EMPLOYEE])).toBe('/tasks');
  });

  it('gates tasks / team / admin', () => {
    expect(canAccessTasks([Roles.EMPLOYEE])).toBe(true);
    expect(canAccessTasks([Roles.ADMIN])).toBe(false);
    expect(canAccessTeam([Roles.MANAGER])).toBe(true);
    expect(canAccessTeam([Roles.EMPLOYEE])).toBe(false);
    expect(canAccessAdmin([Roles.ADMIN])).toBe(true);
  });
});

describe('getVisibleNavItems', () => {
  it('hides Team from Employees (FS59)', () => {
    const labels = getVisibleNavItems([Roles.EMPLOYEE]).map((i) => i.label);
    expect(labels).toEqual(['My Tasks']);
    expect(labels).not.toContain('Team');
    expect(canAccessTeam([Roles.EMPLOYEE])).toBe(false);
  });

  it('shows My Tasks + Team for Manager', () => {
    const labels = getVisibleNavItems([
      Roles.MANAGER,
      Roles.EMPLOYEE,
    ]).map((i) => i.label);
    expect(labels).toEqual(['My Tasks', 'Team']);
  });

  it('hides Admin from non-admins (FS67)', () => {
    expect(getVisibleNavItems([Roles.EMPLOYEE]).map((i) => i.label)).not.toContain(
      'Admin',
    );
    expect(
      getVisibleNavItems([Roles.MANAGER, Roles.EMPLOYEE]).map((i) => i.label),
    ).not.toContain('Admin');
    expect(canAccessAdmin([Roles.EMPLOYEE])).toBe(false);
  });

  it('Admin-only has no task UI nav (FS66)', () => {
    const labels = getVisibleNavItems([Roles.ADMIN]).map((i) => i.label);
    expect(labels).toEqual(['Admin']);
    expect(labels).not.toContain('My Tasks');
    expect(labels).not.toContain('Team');
    expect(isAdminOnly([Roles.ADMIN])).toBe(true);
  });

  it('dual-role Admin+Manager still sees Tasks and Team (FS66)', () => {
    const labels = getVisibleNavItems([
      Roles.ADMIN,
      Roles.MANAGER,
      Roles.EMPLOYEE,
    ]).map((i) => i.label);
    expect(labels).toEqual(['My Tasks', 'Team', 'Admin']);
  });
});
