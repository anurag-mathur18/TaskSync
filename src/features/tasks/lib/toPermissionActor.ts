import type { UserDto } from '@/shared-kernel';
import type { PermissionActor } from '@/shared/lib/permissions';

export function toPermissionActor(user: UserDto): PermissionActor {
  return {
    id: user.id,
    roles: user.roles,
    reportIds: user.reportIds,
  };
}
