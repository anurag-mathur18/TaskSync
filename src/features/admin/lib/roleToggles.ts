import { Roles, type Role } from '@/shared-kernel';

/** Client-side role edit: Manager always implies Employee. Admin is not toggled here. */
export function nextRolesFromToggles(
  current: readonly Role[],
  next: { employee: boolean; manager: boolean },
): Role[] {
  const roles = new Set<Role>();

  if (current.includes(Roles.ADMIN)) {
    roles.add(Roles.ADMIN);
  }

  if (next.manager) {
    roles.add(Roles.MANAGER);
    roles.add(Roles.EMPLOYEE);
  } else if (next.employee) {
    roles.add(Roles.EMPLOYEE);
  }

  if (roles.size === 0) {
    // Keep at least Employee if stripping would leave empty (API requires min 1)
    roles.add(Roles.EMPLOYEE);
  }

  return Array.from(roles);
}
