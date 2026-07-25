import { Roles, type Role } from '@/shared-kernel';

export function hasRole(roles: readonly Role[], role: Role): boolean {
  return roles.includes(role);
}

export function hasAnyRole(
  roles: readonly Role[],
  required: readonly Role[],
): boolean {
  return required.some((role) => roles.includes(role));
}

/** Task UI for users with Employee or Manager capability (not Admin-only). */
export function canAccessTasks(roles: readonly Role[]): boolean {
  return hasAnyRole(roles, [Roles.EMPLOYEE, Roles.MANAGER]);
}

export function canAccessTeam(roles: readonly Role[]): boolean {
  return hasRole(roles, Roles.MANAGER);
}

export function canAccessAdmin(roles: readonly Role[]): boolean {
  return hasRole(roles, Roles.ADMIN);
}

/** ADMIN without EMPLOYEE/MANAGER — RBAC console only. */
export function isAdminOnly(roles: readonly Role[]): boolean {
  return canAccessAdmin(roles) && !canAccessTasks(roles);
}

/** Post-login / `/` landing path by role. */
export function getHomePath(roles: readonly Role[]): string {
  return isAdminOnly(roles) ? '/admin' : '/tasks';
}
