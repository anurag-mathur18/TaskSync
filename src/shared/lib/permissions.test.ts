import { describe, expect, it } from 'vitest';

import {
  canCloseTask,
  canCreateTaskForOwner,
  canDeleteTask,
  canEditTask,
  canViewTask,
  getAllowedStatusOptions,
  isAdmin,
  isDirectReportTask,
  isEmployeeCapable,
  isManager,
  isOwnTask,
  isTerminalClosed,
  type PermissionActor,
  type PermissionTask,
} from '@/shared/lib/permissions';
import { Roles, TaskStatuses } from '@/shared-kernel';

const IDS = {
  admin: '11111111-1111-4111-8111-111111111111',
  manager: '22222222-2222-4222-8222-222222222222',
  alex: '33333333-3333-4333-8333-333333333333',
  sam: '44444444-4444-4444-8444-444444444444',
  outsider: '55555555-5555-4555-8555-555555555555',
  task: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
} as const;

function actor(
  partial: Pick<PermissionActor, 'id' | 'roles'> &
    Partial<Pick<PermissionActor, 'reportIds'>>,
): PermissionActor {
  return partial;
}

function task(
  ownerId: string,
  status: PermissionTask['status'],
): PermissionTask {
  return {
    id: IDS.task,
    status,
    owner: { id: ownerId },
  };
}

const employee = actor({
  id: IDS.alex,
  roles: [Roles.EMPLOYEE],
});

const manager = actor({
  id: IDS.manager,
  roles: [Roles.MANAGER, Roles.EMPLOYEE],
  reportIds: [IDS.alex, IDS.sam],
});

const adminOnly = actor({
  id: IDS.admin,
  roles: [Roles.ADMIN],
});

const outsider = actor({
  id: IDS.outsider,
  roles: [Roles.EMPLOYEE],
});

describe('role checks', () => {
  it('classifies Admin / Manager / Employee-capable', () => {
    expect(isAdmin(adminOnly)).toBe(true);
    expect(isAdmin(manager)).toBe(false);
    expect(isManager(manager)).toBe(true);
    expect(isManager(employee)).toBe(false);
    expect(isEmployeeCapable(employee)).toBe(true);
    expect(isEmployeeCapable(manager)).toBe(true);
    expect(isEmployeeCapable(adminOnly)).toBe(false);
  });
});

describe('scope helpers', () => {
  it('detects own vs report tasks', () => {
    const own = task(IDS.alex, TaskStatuses.IN_PROGRESS);
    const report = task(IDS.alex, TaskStatuses.DONE);
    const other = task(IDS.outsider, TaskStatuses.IN_PROGRESS);

    expect(isOwnTask(employee, own)).toBe(true);
    expect(isOwnTask(manager, report)).toBe(false);
    expect(isDirectReportTask(manager, report)).toBe(true);
    expect(isDirectReportTask(manager, other)).toBe(false);
    expect(isDirectReportTask(employee, report)).toBe(false);
  });
});

describe('permissions matrix (FS38)', () => {
  describe('Employee', () => {
    it('can view/edit/delete own In Progress and Done; never Close', () => {
      const inProgress = task(IDS.alex, TaskStatuses.IN_PROGRESS);
      const done = task(IDS.alex, TaskStatuses.DONE);

      for (const t of [inProgress, done]) {
        expect(canViewTask(employee, t)).toBe(true);
        expect(canEditTask(employee, t)).toBe(true);
        expect(canDeleteTask(employee, t)).toBe(true);
        expect(canCloseTask(employee, t)).toBe(false);
      }
    });

    it('cannot edit/delete own Closed; Close only from Done (never for Employee)', () => {
      const closed = task(IDS.alex, TaskStatuses.CLOSED);
      expect(canViewTask(employee, closed)).toBe(true);
      expect(canEditTask(employee, closed)).toBe(false);
      expect(canDeleteTask(employee, closed)).toBe(false);
      expect(canCloseTask(employee, closed)).toBe(false);
      expect(isTerminalClosed(closed)).toBe(true);
    });

    it('cannot act on others’ tasks', () => {
      const samTask = task(IDS.sam, TaskStatuses.DONE);
      expect(canViewTask(employee, samTask)).toBe(false);
      expect(canEditTask(employee, samTask)).toBe(false);
      expect(canDeleteTask(employee, samTask)).toBe(false);
      expect(canCloseTask(employee, samTask)).toBe(false);
    });

    it('can create only for self', () => {
      expect(canCreateTaskForOwner(employee, IDS.alex)).toBe(true);
      expect(canCreateTaskForOwner(employee, IDS.sam)).toBe(false);
    });
  });

  describe('Manager', () => {
    it('can manage own tasks including Close from Done and delete Closed', () => {
      const ownDone = task(IDS.manager, TaskStatuses.DONE);
      const ownClosed = task(IDS.manager, TaskStatuses.CLOSED);
      const ownInProgress = task(IDS.manager, TaskStatuses.IN_PROGRESS);

      expect(canViewTask(manager, ownDone)).toBe(true);
      expect(canEditTask(manager, ownDone)).toBe(true);
      expect(canCloseTask(manager, ownDone)).toBe(true);
      expect(canCloseTask(manager, ownInProgress)).toBe(false);
      expect(canDeleteTask(manager, ownClosed)).toBe(true);
      expect(canEditTask(manager, ownClosed)).toBe(false);
    });

    it('can view/edit/delete/close report tasks; Close only from Done', () => {
      const reportInProgress = task(IDS.alex, TaskStatuses.IN_PROGRESS);
      const reportDone = task(IDS.alex, TaskStatuses.DONE);
      const reportClosed = task(IDS.alex, TaskStatuses.CLOSED);

      expect(canViewTask(manager, reportInProgress)).toBe(true);
      expect(canEditTask(manager, reportInProgress)).toBe(true);
      expect(canDeleteTask(manager, reportInProgress)).toBe(true);
      expect(canCloseTask(manager, reportInProgress)).toBe(false);

      expect(canCloseTask(manager, reportDone)).toBe(true);
      expect(canEditTask(manager, reportDone)).toBe(true);

      expect(canViewTask(manager, reportClosed)).toBe(true);
      expect(canEditTask(manager, reportClosed)).toBe(false);
      expect(canDeleteTask(manager, reportClosed)).toBe(true);
      expect(canCloseTask(manager, reportClosed)).toBe(false);
    });

    it('cannot manage outsider (non-report) tasks', () => {
      const outsiderTask = task(IDS.outsider, TaskStatuses.DONE);
      expect(canViewTask(manager, outsiderTask)).toBe(false);
      expect(canEditTask(manager, outsiderTask)).toBe(false);
      expect(canDeleteTask(manager, outsiderTask)).toBe(false);
      expect(canCloseTask(manager, outsiderTask)).toBe(false);
    });

    it('can create for self or direct reports', () => {
      expect(canCreateTaskForOwner(manager, IDS.manager)).toBe(true);
      expect(canCreateTaskForOwner(manager, IDS.alex)).toBe(true);
      expect(canCreateTaskForOwner(manager, IDS.outsider)).toBe(false);
    });
  });

  describe('Admin-only', () => {
    it('has no task capabilities by Admin alone', () => {
      const anyTask = task(IDS.alex, TaskStatuses.DONE);
      expect(canViewTask(adminOnly, anyTask)).toBe(false);
      expect(canEditTask(adminOnly, anyTask)).toBe(false);
      expect(canDeleteTask(adminOnly, anyTask)).toBe(false);
      expect(canCloseTask(adminOnly, anyTask)).toBe(false);
      expect(canCreateTaskForOwner(adminOnly, IDS.admin)).toBe(false);
      expect(canCreateTaskForOwner(adminOnly, IDS.alex)).toBe(false);
    });
  });

  describe('outsider employee', () => {
    it('cannot see manager-team tasks', () => {
      const alexDone = task(IDS.alex, TaskStatuses.DONE);
      expect(canViewTask(outsider, alexDone)).toBe(false);
      expect(canCloseTask(outsider, alexDone)).toBe(false);
    });
  });
});

describe('getAllowedStatusOptions (FS39)', () => {
  it('Employee never sees Closed in options', () => {
    const ownInProgress = task(IDS.alex, TaskStatuses.IN_PROGRESS);
    const ownDone = task(IDS.alex, TaskStatuses.DONE);

    expect(getAllowedStatusOptions(employee, ownInProgress)).toEqual([
      TaskStatuses.IN_PROGRESS,
      TaskStatuses.DONE,
    ]);
    expect(getAllowedStatusOptions(employee, ownDone)).toEqual([
      TaskStatuses.IN_PROGRESS,
      TaskStatuses.DONE,
    ]);
    expect(
      getAllowedStatusOptions(employee, ownInProgress),
    ).not.toContain(TaskStatuses.CLOSED);
  });

  it('Closed tasks yield empty options (terminal)', () => {
    const closed = task(IDS.alex, TaskStatuses.CLOSED);
    expect(getAllowedStatusOptions(employee, closed)).toEqual([]);
    expect(getAllowedStatusOptions(manager, closed)).toEqual([]);
  });

  it('Manager gets In Progress / Done only; Close stays a separate action', () => {
    const reportDone = task(IDS.alex, TaskStatuses.DONE);
    expect(getAllowedStatusOptions(manager, reportDone)).toEqual([
      TaskStatuses.IN_PROGRESS,
      TaskStatuses.DONE,
    ]);
    expect(canCloseTask(manager, reportDone)).toBe(true);
  });

  it('returns empty when actor cannot view the task', () => {
    const alexDone = task(IDS.alex, TaskStatuses.DONE);
    expect(getAllowedStatusOptions(outsider, alexDone)).toEqual([]);
    expect(getAllowedStatusOptions(adminOnly, alexDone)).toEqual([]);
  });
});
