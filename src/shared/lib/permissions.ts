import {
  Roles,
  TaskStatuses,
  type Role,
  type TaskStatus,
} from '@/shared-kernel';

/** Session actor for UI RBAC (from `getMe` / UserDto). */
export type PermissionActor = {
  id: string;
  roles: readonly Role[];
  /** Direct report user IDs when known (Manager). */
  reportIds?: readonly string[];
};

/** Minimal task shape for permission checks (satisfied by `TaskDto`). */
export type PermissionTask = {
  id: string;
  status: TaskStatus;
  owner: { id: string };
};

export function isAdmin(actor: PermissionActor): boolean {
  return actor.roles.includes(Roles.ADMIN);
}

export function isManager(actor: PermissionActor): boolean {
  return actor.roles.includes(Roles.MANAGER);
}

/** EMPLOYEE or MANAGER — can use task UI. */
export function isEmployeeCapable(actor: PermissionActor): boolean {
  return (
    actor.roles.includes(Roles.EMPLOYEE) ||
    actor.roles.includes(Roles.MANAGER)
  );
}

export function isOwnTask(
  actor: PermissionActor,
  task: PermissionTask,
): boolean {
  return task.owner.id === actor.id;
}

export function isDirectReportTask(
  actor: PermissionActor,
  task: PermissionTask,
): boolean {
  if (!isManager(actor)) return false;
  return actor.reportIds?.includes(task.owner.id) ?? false;
}

export function canViewTask(
  actor: PermissionActor,
  task: PermissionTask,
): boolean {
  if (isOwnTask(actor, task)) return true;
  return isDirectReportTask(actor, task);
}

export function canEditTask(
  actor: PermissionActor,
  task: PermissionTask,
): boolean {
  if (task.status === TaskStatuses.CLOSED) return false;
  return canViewTask(actor, task);
}

/**
 * Owner may delete non-Closed own tasks.
 * Manager may delete own or report tasks in any status (including Closed).
 */
export function canDeleteTask(
  actor: PermissionActor,
  task: PermissionTask,
): boolean {
  const own = isOwnTask(actor, task);

  if (own && task.status !== TaskStatuses.CLOSED) return true;

  if (isManager(actor) && (own || isDirectReportTask(actor, task))) {
    return true;
  }

  return false;
}

/** Manager Close only from Done, for own or direct-report tasks. */
export function canCloseTask(
  actor: PermissionActor,
  task: PermissionTask,
): boolean {
  if (!isManager(actor)) return false;
  if (task.status !== TaskStatuses.DONE) return false;
  return isOwnTask(actor, task) || isDirectReportTask(actor, task);
}

export function canCreateTaskForOwner(
  actor: PermissionActor,
  ownerId: string,
): boolean {
  if (!isEmployeeCapable(actor)) return false;
  if (ownerId === actor.id) return true;
  return isManager(actor) && (actor.reportIds?.includes(ownerId) ?? false);
}

export function isTerminalClosed(task: PermissionTask): boolean {
  return task.status === TaskStatuses.CLOSED;
}

/**
 * Status select options for the detail control.
 * `CLOSED` is never listed — Close is a separate Manager action (`canCloseTask`).
 */
export function getAllowedStatusOptions(
  actor: PermissionActor,
  task: PermissionTask,
): TaskStatus[] {
  if (isTerminalClosed(task)) return [];
  if (!canViewTask(actor, task)) return [];
  if (!isEmployeeCapable(actor)) return [];

  return [TaskStatuses.IN_PROGRESS, TaskStatuses.DONE];
}
