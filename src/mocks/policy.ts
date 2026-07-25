import {
  Roles,
  TaskStatuses,
  type Role,
  type TaskStatus,
} from '@/shared-kernel';
import type { SeedTaskRecord, SeedUserRecord } from '@/mocks/seed';
import { getDirectReportIds } from '@/mocks/db';

export type Actor = {
  id: string;
  orgId: string;
  roles: Role[];
};

export function toActor(user: SeedUserRecord): Actor {
  return {
    id: user.id,
    orgId: user.orgId,
    roles: user.roles,
  };
}

export function isAdmin(actor: Actor): boolean {
  return actor.roles.includes(Roles.ADMIN);
}

export function isManager(actor: Actor): boolean {
  return actor.roles.includes(Roles.MANAGER);
}

export function isEmployeeCapable(actor: Actor): boolean {
  return (
    actor.roles.includes(Roles.EMPLOYEE) ||
    actor.roles.includes(Roles.MANAGER)
  );
}

export function isDirectReport(managerId: string, employeeId: string): boolean {
  return getDirectReportIds(managerId).includes(employeeId);
}

export function canViewTask(actor: Actor, task: SeedTaskRecord): boolean {
  if (task.ownerId === actor.id) return true;
  return isManager(actor) && isDirectReport(actor.id, task.ownerId);
}

export function canMutateTask(actor: Actor, task: SeedTaskRecord): boolean {
  if (task.status === TaskStatuses.CLOSED) return false;
  return canViewTask(actor, task);
}

export function canCloseTask(actor: Actor, task: SeedTaskRecord): boolean {
  if (!isManager(actor)) return false;
  if (task.status !== TaskStatuses.DONE) return false;
  return task.ownerId === actor.id || isDirectReport(actor.id, task.ownerId);
}

export function canDeleteTask(actor: Actor, task: SeedTaskRecord): boolean {
  const isOwner = task.ownerId === actor.id;
  const managesOwner =
    isManager(actor) && isDirectReport(actor.id, task.ownerId);

  if (isOwner && task.status !== TaskStatuses.CLOSED) return true;
  if (managesOwner) return true;
  if (isManager(actor) && isOwner) return true;
  return false;
}

export function canAssignOwner(actor: Actor, ownerId: string): boolean {
  if (!isEmployeeCapable(actor)) return false;
  if (ownerId === actor.id) return true;
  return isManager(actor) && isDirectReport(actor.id, ownerId);
}

export function isValidTransition(from: TaskStatus, to: TaskStatus): boolean {
  if (from === to) return false;
  if (from === TaskStatuses.CLOSED) return false;
  if (to === TaskStatuses.CLOSED) return from === TaskStatuses.DONE;
  if (from === TaskStatuses.IN_PROGRESS && to === TaskStatuses.DONE) return true;
  if (from === TaskStatuses.DONE && to === TaskStatuses.IN_PROGRESS) return true;
  return false;
}

/** Normalize roles: MANAGER implies EMPLOYEE. */
export function normalizeRoles(roles: Role[]): Role[] {
  const unique = Array.from(new Set(roles));
  if (unique.includes(Roles.MANAGER) && !unique.includes(Roles.EMPLOYEE)) {
    unique.push(Roles.EMPLOYEE);
  }
  return unique;
}
