import { http, HttpResponse } from 'msw';

import { findTaskById, findUserById, getDb } from '@/mocks/db';
import { apiError, requireActor, toUserSummary } from '@/mocks/http';
import {
  canAssignOwner,
  canCloseTask,
  canDeleteTask,
  canMutateTask,
  canViewTask,
  isEmployeeCapable,
  isManager,
  isValidTransition,
} from '@/mocks/policy';
import type { SeedTaskRecord } from '@/mocks/seed';
import {
  TaskStatuses,
  createTaskSchema,
  statusLabelFor,
  taskStatusSchema,
  updateTaskSchema,
  type TaskDto,
} from '@/shared-kernel';

const API = '/api/v1';

function toTaskDto(task: SeedTaskRecord): TaskDto | null {
  const owner = findUserById(task.ownerId);
  const createdBy = findUserById(task.createdById);
  const lastModifiedBy = findUserById(task.lastModifiedById);
  if (!owner || !createdBy || !lastModifiedBy) return null;

  return {
    id: task.id,
    name: task.name,
    description: task.description,
    dueDate: task.dueDate,
    status: task.status,
    statusLabel: statusLabelFor(task.status),
    owner: toUserSummary(owner),
    createdBy: toUserSummary(createdBy),
    lastModifiedBy: toUserSummary(lastModifiedBy),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function parseBool(value: string | null, fallback: boolean): boolean {
  if (value == null) return fallback;
  return value === 'true' || value === '1';
}

export const taskHandlers = [
  http.get(`${API}/tasks`, ({ request }) => {
    const auth = requireActor(request);
    if (auth instanceof Response) return auth;
    const { actor } = auth;

    if (!isEmployeeCapable(actor)) {
      return apiError(
        403,
        'RBAC_DENIED',
        'Admin-only users cannot access tasks.',
      );
    }

    const url = new URL(request.url);
    const scope = url.searchParams.get('scope') ?? 'mine';
    const statusFilter = url.searchParams.get('status');
    const ownerIdFilter = url.searchParams.get('ownerId');
    const page = Math.max(1, Number(url.searchParams.get('page') ?? '1'));
    const pageSize = Math.min(
      100,
      Math.max(1, Number(url.searchParams.get('pageSize') ?? '20')),
    );

    const includeClosedDefault = scope === 'team';
    const includeClosed = parseBool(
      url.searchParams.get('includeClosed'),
      includeClosedDefault,
    );

    if (scope === 'team' && !isManager(actor)) {
      return apiError(403, 'RBAC_DENIED', 'Team scope requires Manager role.');
    }

    if (ownerIdFilter && !isManager(actor)) {
      return apiError(403, 'RBAC_DENIED', 'ownerId filter requires Manager role.');
    }

    if (
      ownerIdFilter &&
      isManager(actor) &&
      ownerIdFilter !== actor.id &&
      !canAssignOwner(actor, ownerIdFilter)
    ) {
      return apiError(403, 'RBAC_DENIED', 'Owner is not a direct report.');
    }

    let tasks = getDb().tasks.filter((task) => task.deletedAt == null);

    if (scope === 'mine') {
      tasks = tasks.filter((task) => task.ownerId === actor.id);
    } else {
      tasks = tasks.filter((task) => canViewTask(actor, task));
    }

    if (ownerIdFilter) {
      tasks = tasks.filter((task) => task.ownerId === ownerIdFilter);
    }

    if (statusFilter) {
      const parsedStatus = taskStatusSchema.safeParse(statusFilter);
      if (!parsedStatus.success) {
        return apiError(400, 'VALIDATION_ERROR', 'Invalid status filter.');
      }
      tasks = tasks.filter((task) => task.status === parsedStatus.data);
    }

    if (!includeClosed) {
      tasks = tasks.filter((task) => task.status !== TaskStatuses.CLOSED);
    }

    const total = tasks.length;
    const start = (page - 1) * pageSize;
    const pageTasks = tasks.slice(start, start + pageSize);
    const data = pageTasks
      .map(toTaskDto)
      .filter((task): task is TaskDto => task != null);

    return HttpResponse.json({
      data,
      meta: { page, pageSize, total },
    });
  }),

  http.post(`${API}/tasks`, async ({ request }) => {
    const auth = requireActor(request);
    if (auth instanceof Response) return auth;
    const { actor } = auth;

    if (!isEmployeeCapable(actor)) {
      return apiError(
        403,
        'RBAC_DENIED',
        'Admin-only users cannot create tasks.',
      );
    }

    const json: unknown = await request.json();
    const parsed = createTaskSchema.safeParse(json);
    if (!parsed.success) {
      return apiError(400, 'VALIDATION_ERROR', 'Invalid task payload.', {
        issues: parsed.error.issues,
      });
    }

    const ownerId = parsed.data.ownerId ?? actor.id;
    if (!canAssignOwner(actor, ownerId)) {
      return apiError(
        403,
        'RBAC_DENIED',
        'You cannot create a task for this owner.',
      );
    }

    if (!findUserById(ownerId)) {
      return apiError(404, 'NOT_FOUND', 'Owner not found.');
    }

    const now = new Date().toISOString();
    const task: SeedTaskRecord = {
      id: crypto.randomUUID(),
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      dueDate: parsed.data.dueDate ?? null,
      status: TaskStatuses.IN_PROGRESS,
      ownerId,
      createdById: actor.id,
      lastModifiedById: actor.id,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    };

    getDb().tasks.push(task);
    const dto = toTaskDto(task);
    return HttpResponse.json(dto, { status: 201 });
  }),

  http.get(`${API}/tasks/:id`, ({ params, request }) => {
    const auth = requireActor(request);
    if (auth instanceof Response) return auth;

    const task = findTaskById(String(params.id));
    if (!task || task.deletedAt != null) {
      return apiError(404, 'NOT_FOUND', 'Task not found.');
    }

    if (!canViewTask(auth.actor, task)) {
      return apiError(404, 'NOT_FOUND', 'Task not found.');
    }

    const dto = toTaskDto(task);
    if (!dto) return apiError(500, 'INTERNAL', 'Task data incomplete.');
    return HttpResponse.json(dto);
  }),

  http.patch(`${API}/tasks/:id`, async ({ params, request }) => {
    const auth = requireActor(request);
    if (auth instanceof Response) return auth;
    const { actor } = auth;

    const task = findTaskById(String(params.id));
    if (!task || task.deletedAt != null) {
      return apiError(404, 'NOT_FOUND', 'Task not found.');
    }

    if (!canViewTask(actor, task)) {
      return apiError(404, 'NOT_FOUND', 'Task not found.');
    }

    const json: unknown = await request.json();
    const parsed = updateTaskSchema.safeParse(json);
    if (!parsed.success) {
      return apiError(400, 'VALIDATION_ERROR', 'Invalid task patch.', {
        issues: parsed.error.issues,
      });
    }

    const patch = parsed.data;

    if (
      patch.name !== undefined ||
      patch.description !== undefined ||
      patch.dueDate !== undefined
    ) {
      if (!canMutateTask(actor, task)) {
        return apiError(
          403,
          'RBAC_DENIED',
          'You cannot edit this task.',
        );
      }
    }

    if (patch.status !== undefined) {
      if (!isValidTransition(task.status, patch.status)) {
        return apiError(
          409,
          'INVALID_STATUS_TRANSITION',
          `Cannot transition from ${task.status} to ${patch.status}.`,
        );
      }

      if (patch.status === TaskStatuses.CLOSED) {
        if (!canCloseTask(actor, task)) {
          return apiError(403, 'RBAC_DENIED', 'You cannot close this task.');
        }
      } else if (!canMutateTask(actor, task)) {
        return apiError(
          403,
          'RBAC_DENIED',
          'You cannot change status on this task.',
        );
      }
    }

    const now = new Date().toISOString();
    if (patch.name !== undefined) task.name = patch.name;
    if (patch.description !== undefined) {
      task.description =
        patch.description === '' ? null : patch.description;
    }
    if (patch.dueDate !== undefined) task.dueDate = patch.dueDate;
    if (patch.status !== undefined) task.status = patch.status;
    task.lastModifiedById = actor.id;
    task.updatedAt = now;

    const dto = toTaskDto(task);
    if (!dto) return apiError(500, 'INTERNAL', 'Task data incomplete.');
    return HttpResponse.json(dto);
  }),

  http.delete(`${API}/tasks/:id`, ({ params, request }) => {
    const auth = requireActor(request);
    if (auth instanceof Response) return auth;

    const task = findTaskById(String(params.id));
    if (!task || task.deletedAt != null) {
      return apiError(404, 'NOT_FOUND', 'Task not found.');
    }

    if (!canViewTask(auth.actor, task)) {
      return apiError(404, 'NOT_FOUND', 'Task not found.');
    }

    if (!canDeleteTask(auth.actor, task)) {
      return apiError(403, 'RBAC_DENIED', 'You cannot delete this task.');
    }

    task.deletedAt = new Date().toISOString();
    task.lastModifiedById = auth.actor.id;
    task.updatedAt = task.deletedAt;

    return new HttpResponse(null, { status: 204 });
  }),
];
