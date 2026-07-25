import { HttpResponse } from 'msw';

import {
  findUserById,
  getDb,
  getDirectReportIds,
} from '@/mocks/db';
import { toActor, type Actor } from '@/mocks/policy';
import type { SeedUserRecord } from '@/mocks/seed';
import { Roles, type UserDto, type UserSummary } from '@/shared-kernel';

export type ApiErrorBody = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
};

export function apiError(
  status: number,
  code: string,
  message: string,
  details: Record<string, unknown> = {},
) {
  const body: ApiErrorBody = { error: { code, message, details } };
  return HttpResponse.json(body, { status });
}

export function toUserSummary(user: SeedUserRecord): UserSummary {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
  };
}

export function toUserDto(user: SeedUserRecord): UserDto {
  const dto: UserDto = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    roles: user.roles,
    managerId: user.managerId,
    orgId: user.orgId,
  };

  if (user.roles.includes(Roles.MANAGER)) {
    dto.reportIds = getDirectReportIds(user.id);
  }

  return dto;
}

export function getBearerToken(request: Request): string | null {
  const header = request.headers.get('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice('Bearer '.length).trim() || null;
}

export function requireActor(
  request: Request,
): { actor: Actor; user: SeedUserRecord } | Response {
  const token = getBearerToken(request);
  if (!token) {
    return apiError(401, 'UNAUTHENTICATED', 'Authentication required.');
  }

  const userId = getDb().sessions.get(token);
  if (!userId) {
    return apiError(401, 'UNAUTHENTICATED', 'Invalid or expired session.');
  }

  const user = findUserById(userId);
  if (!user) {
    return apiError(401, 'UNAUTHENTICATED', 'Invalid or expired session.');
  }

  return { actor: toActor(user), user };
}

export function createAccessToken(userId: string): string {
  const token = `mock-token-${userId}-${crypto.randomUUID()}`;
  getDb().sessions.set(token, userId);
  return token;
}

export function revokeToken(token: string | null): void {
  if (!token) return;
  getDb().sessions.delete(token);
}
