import { Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import {
  useGetAdminUsersQuery,
  useSetUserManagerMutation,
  useUpdateUserRolesMutation,
} from '@/features/admin/api/adminApi';
import { RoleSummaryCards } from '@/features/admin/components/RoleSummaryCards';
import { nextRolesFromToggles } from '@/features/admin/lib/roleToggles';
import { useSession } from '@/features/auth';
import { canAccessTasks, isAdminOnly } from '@/shared/lib/roles';
import { toastApiError } from '@/shared/lib/apiError';
import { Button } from '@/shared/ui/atoms/Button';
import { Select } from '@/shared/ui/atoms/Select';
import { Spinner } from '@/shared/ui/atoms/Spinner';
import { TextInput } from '@/shared/ui/atoms/TextInput';
import { SkeletonRows } from '@/shared/ui/molecules/Skeleton';
import { StatusChip } from '@/shared/ui/molecules/StatusChip';
import {
  DataTable,
  PageHeader,
  toast,
  type DataTableColumn,
} from '@/shared/ui/organisms';
import { Roles, type AdminUserDto, type Role } from '@/shared-kernel';

export function AdminPage() {
  const { user } = useSession();
  const [query, setQuery] = useState('');
  const { data: users = [], isLoading, isError, refetch } =
    useGetAdminUsersQuery();
  const [updateRoles, { isLoading: isUpdatingRoles }] =
    useUpdateUserRolesMutation();
  const [setManager, { isLoading: isUpdatingManager }] =
    useSetUserManagerMutation();

  const managers = useMemo(
    () => users.filter((member) => member.roles.includes(Roles.MANAGER)),
    [users],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return users;
    return users.filter(
      (member) =>
        member.fullName.toLowerCase().includes(needle) ||
        member.email.toLowerCase().includes(needle),
    );
  }, [users, query]);

  const persistRoles = useCallback(
    async (id: string, roles: Role[]) => {
      try {
        await updateRoles({ id, body: { roles } }).unwrap();
        toast.success('Roles updated');
      } catch (error) {
        toastApiError(error, 'Could not update roles');
      }
    },
    [updateRoles],
  );

  const handleRoleToggle = useCallback(
    async (
      member: AdminUserDto,
      field: 'employee' | 'manager',
      checked: boolean,
    ) => {
      let employee = member.roles.includes(Roles.EMPLOYEE);
      let manager = member.roles.includes(Roles.MANAGER);

      if (field === 'employee') {
        employee = checked;
        if (!checked) manager = false;
      } else {
        manager = checked;
        if (checked) employee = true;
      }

      await persistRoles(
        member.id,
        nextRolesFromToggles(member.roles, { employee, manager }),
      );
    },
    [persistRoles],
  );

  const handleManagerChange = useCallback(
    async (memberId: string, managerId: string) => {
      try {
        await setManager({
          id: memberId,
          body: { managerId: managerId === '' ? null : managerId },
        }).unwrap();
        toast.success(managerId ? 'Manager assigned' : 'Manager cleared');
      } catch (error) {
        toastApiError(error, 'Could not update manager');
      }
    },
    [setManager],
  );

  const columns: DataTableColumn<AdminUserDto>[] = useMemo(
    () => [
      {
        id: 'member',
        header: 'Member',
        cell: (row) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-on-surface">{row.fullName}</p>
            <p className="truncate text-body-sm text-on-surface-variant">
              {row.email}
            </p>
          </div>
        ),
      },
      {
        id: 'roles',
        header: 'Roles',
        cell: (row) => (
          <div className="flex flex-col gap-sm">
            <div className="flex flex-wrap gap-xs">
              {row.roles.map((role) => (
                <StatusChip
                  key={role}
                  label={roleLabel(role)}
                  tone={roleTone(role)}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-md">
              <label className="flex min-h-11 items-center gap-sm text-body-sm text-on-surface">
                <input
                  type="checkbox"
                  className="size-4 rounded-sm border-2 border-outline accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  checked={row.roles.includes(Roles.EMPLOYEE)}
                  disabled={isUpdatingRoles}
                  onChange={(event) => {
                    void handleRoleToggle(row, 'employee', event.target.checked);
                  }}
                />
                Employee
              </label>
              <label className="flex min-h-11 items-center gap-sm text-body-sm text-on-surface">
                <input
                  type="checkbox"
                  className="size-4 rounded-sm border-2 border-outline accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  checked={row.roles.includes(Roles.MANAGER)}
                  disabled={isUpdatingRoles}
                  onChange={(event) => {
                    void handleRoleToggle(row, 'manager', event.target.checked);
                  }}
                />
                Manager
              </label>
            </div>
            {row.roles.includes(Roles.ADMIN) ? (
              <p className="text-body-sm text-on-surface-variant">
                Admin is managed via seed / ops (not toggled here).
              </p>
            ) : null}
          </div>
        ),
      },
      {
        id: 'manager',
        header: 'Manager',
        cell: (row) => {
          if (!canAccessTasks(row.roles)) {
            return (
              <span className="text-body-sm text-on-surface-variant">—</span>
            );
          }
          return (
            <Select
              aria-label={`Manager for ${row.fullName}`}
              value={row.managerId ?? ''}
              disabled={isUpdatingManager}
              className="min-w-[180px]"
              onChange={(event) => {
                void handleManagerChange(row.id, event.target.value);
              }}
            >
              <option value="">No manager</option>
              {managers
                .filter((manager) => manager.id !== row.id)
                .map((manager) => (
                  <option key={manager.id} value={manager.id}>
                    {manager.fullName}
                  </option>
                ))}
            </Select>
          );
        },
      },
    ],
    [
      handleManagerChange,
      handleRoleToggle,
      isUpdatingManager,
      isUpdatingRoles,
      managers,
    ],
  );

  const adminOnlySession = user ? isAdminOnly(user.roles) : false;

  return (
    <div className="flex flex-col gap-xl">
      <PageHeader
        title="User Management"
        description="Manage organization members, define roles, and control access permissions."
        actions={
          <div className="relative w-full min-w-[220px] sm:w-72">
            <Search
              className="pointer-events-none absolute left-md top-1/2 size-4 -translate-y-1/2 text-outline"
              aria-hidden
            />
            <TextInput
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Search members…"
              aria-label="Search members"
              className="pl-10"
            />
          </div>
        }
      />

      {adminOnlySession ? (
        <p
          role="status"
          className="rounded-md border border-outline-variant bg-surface-container-low px-md py-sm text-body-sm text-on-surface-variant"
        >
          Admin-only accounts manage RBAC and hierarchy here. Task and Team
          workspaces are hidden unless Employee or Manager is also granted.
        </p>
      ) : null}

      {isError ? (
        <div className="flex flex-col items-center gap-md py-xl text-center">
          <p className="text-body-md text-error">Could not load members.</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void refetch();
            }}
          >
            Retry
          </Button>
        </div>
      ) : null}

      {!isError && isLoading ? (
        <SkeletonRows count={4} rowClassName="h-24" />
      ) : null}

      {!isError && !isLoading ? (
        <>
          <RoleSummaryCards users={users} />

          <section className="flex flex-col gap-md">
            <div className="flex items-center justify-between gap-md">
              <h2 className="text-headline-md text-on-surface">
                Organization members
              </h2>
              {isUpdatingRoles || isUpdatingManager ? (
                <span className="flex items-center gap-sm text-body-sm text-on-surface-variant">
                  <Spinner size="sm" label="Saving" />
                  Saving…
                </span>
              ) : null}
            </div>

            <DataTable
              caption="Organization members"
              columns={columns}
              rows={filtered}
              getRowId={(row) => row.id}
              emptyMessage={
                query.trim()
                  ? 'No members match your search.'
                  : 'No members found.'
              }
            />
          </section>
        </>
      ) : null}
    </div>
  );
}

function roleLabel(role: Role): string {
  switch (role) {
    case Roles.ADMIN:
      return 'Admin';
    case Roles.MANAGER:
      return 'Manager';
    case Roles.EMPLOYEE:
      return 'Employee';
    default:
      return role;
  }
}

function roleTone(role: Role): 'inProgress' | 'done' | 'closed' | 'neutral' {
  switch (role) {
    case Roles.ADMIN:
      return 'inProgress';
    case Roles.MANAGER:
      return 'done';
    default:
      return 'neutral';
  }
}
