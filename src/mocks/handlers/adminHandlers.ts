import { http, HttpResponse } from 'msw';

import {
  findUserById,
  getDb,
  getDirectReportIds,
} from '@/mocks/db';
import { apiError, requireActor, toUserSummary } from '@/mocks/http';
import { isAdmin, normalizeRoles } from '@/mocks/policy';
import { Roles, setManagerSchema, updateRolesSchema } from '@/shared-kernel';
import type { AdminUserDto } from '@/shared-kernel';

const API = '/api/v1';

function toAdminUserDto(userId: string): AdminUserDto | null {
  const user = findUserById(userId);
  if (!user) return null;

  const manager = user.managerId ? findUserById(user.managerId) : null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    managerId: user.managerId,
    reportIds: user.roles.includes(Roles.MANAGER)
      ? getDirectReportIds(user.id)
      : undefined,
    orgId: user.orgId,
    manager: manager ? toUserSummary(manager) : null,
  };
}

function requireAdmin(request: Request) {
  const auth = requireActor(request);
  if (auth instanceof Response) return auth;
  if (!isAdmin(auth.actor)) {
    return apiError(403, 'RBAC_DENIED', 'Admin role required.');
  }
  return auth;
}

export const adminHandlers = [
  http.get(`${API}/admin/users`, ({ request }) => {
    const auth = requireAdmin(request);
    if (auth instanceof Response) return auth;

    const users = getDb()
      .users.map((user) => toAdminUserDto(user.id))
      .filter((user): user is AdminUserDto => user != null);

    return HttpResponse.json(users);
  }),

  http.patch(`${API}/admin/users/:id/roles`, async ({ params, request }) => {
    const auth = requireAdmin(request);
    if (auth instanceof Response) return auth;

    const user = findUserById(String(params.id));
    if (!user) {
      return apiError(404, 'NOT_FOUND', 'User not found.');
    }

    const json: unknown = await request.json();
    const parsed = updateRolesSchema.safeParse(json);
    if (!parsed.success) {
      return apiError(400, 'VALIDATION_ERROR', 'Invalid roles payload.', {
        issues: parsed.error.issues,
      });
    }

    const nextRoles = normalizeRoles(parsed.data.roles);
    const wasAdmin = user.roles.includes(Roles.ADMIN);
    const staysAdmin = nextRoles.includes(Roles.ADMIN);

    if (wasAdmin && !staysAdmin) {
      const adminCount = getDb().users.filter((candidate) =>
        candidate.roles.includes(Roles.ADMIN),
      ).length;
      if (adminCount <= 1) {
        return apiError(
          409,
          'LAST_ADMIN',
          'Cannot remove the last Admin role.',
        );
      }
    }

    user.roles = nextRoles;

    if (!nextRoles.includes(Roles.MANAGER)) {
      for (const report of getDb().users) {
        if (report.managerId === user.id) {
          report.managerId = null;
        }
      }
    }

    const dto = toAdminUserDto(user.id);
    return HttpResponse.json(dto);
  }),

  http.put(`${API}/admin/users/:id/manager`, async ({ params, request }) => {
    const auth = requireAdmin(request);
    if (auth instanceof Response) return auth;

    const user = findUserById(String(params.id));
    if (!user) {
      return apiError(404, 'NOT_FOUND', 'User not found.');
    }

    const json: unknown = await request.json();
    const parsed = setManagerSchema.safeParse(json);
    if (!parsed.success) {
      return apiError(400, 'VALIDATION_ERROR', 'Invalid manager payload.', {
        issues: parsed.error.issues,
      });
    }

    const { managerId } = parsed.data;

    if (managerId === user.id) {
      return apiError(400, 'VALIDATION_ERROR', 'User cannot manage themselves.');
    }

    if (managerId != null) {
      const manager = findUserById(managerId);
      if (!manager) {
        return apiError(404, 'NOT_FOUND', 'Manager not found.');
      }
      if (!manager.roles.includes(Roles.MANAGER)) {
        return apiError(
          400,
          'VALIDATION_ERROR',
          'Assigned manager must have MANAGER role.',
        );
      }
    }

    user.managerId = managerId;

    const dto = toAdminUserDto(user.id);
    return HttpResponse.json(dto);
  }),

  http.get(`${API}/admin/managers/:id/reports`, ({ params, request }) => {
    const auth = requireActor(request);
    if (auth instanceof Response) return auth;

    const managerId = String(params.id);
    const manager = findUserById(managerId);
    if (!manager) {
      return apiError(404, 'NOT_FOUND', 'Manager not found.');
    }

    const isSelf = auth.actor.id === managerId;
    if (!isAdmin(auth.actor) && !(isSelf && manager.roles.includes(Roles.MANAGER))) {
      return apiError(403, 'RBAC_DENIED', 'Cannot view these reports.');
    }

    const reports = getDirectReportIds(managerId)
      .map((id) => findUserById(id))
      .filter((user): user is NonNullable<typeof user> => user != null)
      .map(toUserSummary);

    return HttpResponse.json(reports);
  }),
];
