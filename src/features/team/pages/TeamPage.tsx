import { Plus, Users } from 'lucide-react';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';

import { useSession } from '@/features/auth';
import {
  formatDueDate,
  TaskStatusBadge,
  toPermissionActor,
  useDeleteTaskMutation,
  useUpdateTaskMutation,
} from '@/features/tasks';
import { CreateTeamTaskDialog } from '@/features/team/components/CreateTeamTaskDialog';
import {
  useGetDirectReportsQuery,
  useGetTeamTasksQuery,
} from '@/features/team/api/teamApi';
import {
  canCloseTask,
  canDeleteTask,
} from '@/shared/lib/permissions';
import { Button } from '@/shared/ui/atoms/Button';
import { Select } from '@/shared/ui/atoms/Select';
import { Spinner } from '@/shared/ui/atoms/Spinner';
import { EmptyState } from '@/shared/ui/molecules/EmptyState';
import { SkeletonRows } from '@/shared/ui/molecules/Skeleton';
import {
  ConfirmDialog,
  DataTable,
  PageHeader,
  toast,
  type DataTableColumn,
} from '@/shared/ui/organisms';
import { toastApiError } from '@/shared/lib/apiError';
import {
  TaskStatuses,
  statusLabelFor,
  type TaskDto,
  type TaskStatus,
} from '@/shared-kernel';

export function TeamPage() {
  const { user } = useSession();
  const navigate = useNavigate();
  const [ownerId, setOwnerId] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<TaskStatus>>(
    () => new Set(),
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TaskDto | null>(null);

  const {
    data: reports = [],
    isLoading: reportsLoading,
  } = useGetDirectReportsQuery(user?.id ?? '', { skip: !user?.id });

  const listArgs = useMemo(
    () => ({
      ownerId: ownerId || undefined,
      includeClosed: true,
      pageSize: 100,
    }),
    [ownerId],
  );

  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useGetTeamTasksQuery(listArgs, { skip: !user });

  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const actor = user ? toPermissionActor(user) : null;

  const tasks = useMemo(() => {
    const rows = data?.data ?? [];
    if (statusFilters.size === 0) {
      return rows.filter((task) => task.status !== TaskStatuses.CLOSED);
    }
    return rows.filter((task) => statusFilters.has(task.status));
  }, [data?.data, statusFilters]);

  const metrics = useMemo(() => {
    const all = data?.data ?? [];
    const active = all.filter((t) => t.status !== TaskStatuses.CLOSED).length;
    const pendingReview = all.filter((t) => t.status === TaskStatuses.DONE).length;
    return {
      active,
      pendingReview,
      reports: reports.length,
    };
  }, [data?.data, reports.length]);

  function toggleStatus(status: TaskStatus) {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  const handleClose = useCallback(
    async (task: TaskDto) => {
      try {
        await updateTask({
          id: task.id,
          patch: { status: TaskStatuses.CLOSED },
        }).unwrap();
        toast.success('Task closed');
      } catch (error) {
        toastApiError(error, 'Could not close task');
      }
    },
    [updateTask],
  );

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    try {
      await deleteTask(pendingDelete.id).unwrap();
      toast.success('Task removed');
      setPendingDelete(null);
    } catch (error) {
      toastApiError(error, 'Could not delete task');
    }
  }

  const columns: DataTableColumn<TaskDto>[] = useMemo(() => {
    if (!actor) return [];
    return [
      {
        id: 'name',
        header: 'Task',
        cell: (row) => (
          <span className="font-medium text-on-surface">{row.name}</span>
        ),
      },
      {
        id: 'assignee',
        header: 'Assignee',
        cell: (row) => row.owner.fullName,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => <TaskStatusBadge status={row.status} />,
      },
      {
        id: 'due',
        header: 'Due date',
        cell: (row) => (
          <span className="text-on-surface-variant">
            {formatDueDate(row.dueDate)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (row) => {
          const closable = canCloseTask(actor, row);
          const deletable = canDeleteTask(actor, row);
          return (
            <div
              className="flex justify-end gap-xs"
              onClick={(event) => {
                event.stopPropagation();
              }}
              onKeyDown={(event) => {
                event.stopPropagation();
              }}
            >
              {closable ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isUpdating}
                  className="min-h-11"
                  onClick={() => {
                    void handleClose(row);
                  }}
                >
                  Close
                </Button>
              ) : null}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="min-h-11"
                onClick={() => {
                  void navigate(`/tasks/${row.id}`);
                }}
              >
                Open
              </Button>
              {deletable ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="min-h-11 text-on-surface-variant hover:text-error"
                  onClick={() => {
                    setPendingDelete(row);
                  }}
                >
                  Delete
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ];
  }, [actor, handleClose, isUpdating, navigate]);

  if (!user) return null;

  const hasNoReports = !reportsLoading && reports.length === 0;
  const showEmptyTasks =
    !isLoading && !isError && !hasNoReports && tasks.length === 0;

  return (
    <div className="flex flex-col gap-xl">
      <PageHeader
        title="Team Oversight"
        description="Monitor direct-report work, close Done tasks, and create on their behalf."
        actions={
          <Button
            type="button"
            disabled={hasNoReports}
            onClick={() => {
              setCreateOpen(true);
            }}
          >
            <Plus className="size-4" aria-hidden />
            Create for team member
          </Button>
        }
      />

      <section className="grid grid-cols-1 gap-md sm:grid-cols-3">
        <MetricCard label="Active tasks" value={isLoading ? '—' : String(metrics.active)} />
        <MetricCard
          label="Pending review"
          value={isLoading ? '—' : String(metrics.pendingReview)}
          hint="Done, awaiting Close"
        />
        <MetricCard
          label="Direct reports"
          value={reportsLoading ? '—' : String(metrics.reports)}
        />
      </section>

      <section className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-md">
        <div className="flex flex-col gap-md lg:flex-row lg:items-end lg:justify-between">
          <FormControl label="Assignee">
            <Select
              value={ownerId}
              disabled={hasNoReports}
              onChange={(event) => {
                setOwnerId(event.target.value);
              }}
              aria-label="Filter by assignee"
            >
              <option value="">All reports</option>
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.fullName}
                </option>
              ))}
            </Select>
          </FormControl>

          <div className="flex flex-col gap-xs">
            <span className="text-label-md uppercase tracking-wider text-on-surface-variant">
              Status
            </span>
            <div className="flex flex-wrap gap-xs" role="group" aria-label="Status filters">
              <button
                type="button"
                aria-pressed={statusFilters.size === 0}
                className={filterChipClass(statusFilters.size === 0)}
                onClick={() => {
                  setStatusFilters(new Set());
                }}
              >
                All
              </button>
              {(
                [
                  TaskStatuses.IN_PROGRESS,
                  TaskStatuses.DONE,
                  TaskStatuses.CLOSED,
                ] as const
              ).map((status) => {
                const selected = statusFilters.has(status);
                return (
                  <button
                    key={status}
                    type="button"
                    aria-pressed={selected}
                    className={filterChipClass(selected)}
                    onClick={() => {
                      toggleStatus(status);
                    }}
                  >
                    {statusLabelFor(status)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isError ? (
          <div className="flex flex-col items-center gap-md py-xl text-center">
            <p className="text-body-md text-error">Could not load team tasks.</p>
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

        {hasNoReports ? (
          <EmptyState
            icon={<Users className="size-10" aria-hidden />}
            title="No direct reports"
            description="Bind employees to this manager in Admin to see team tasks and create on their behalf."
          />
        ) : null}

        {!hasNoReports && (isLoading || reportsLoading || (isFetching && !data)) ? (
          <SkeletonRows count={5} rowClassName="h-12" />
        ) : null}

        {showEmptyTasks ? (
          <EmptyState
            icon={<Users className="size-10" aria-hidden />}
            title="No team tasks"
            description="Create a task for a report, or adjust filters to see more."
            actionLabel="Create for team member"
            onAction={() => {
              setCreateOpen(true);
            }}
          />
        ) : null}

        {!hasNoReports && !isError && tasks.length > 0 ? (
          <DataTable
            caption="Team tasks"
            columns={columns}
            rows={tasks}
            getRowId={(row) => row.id}
            onRowClick={(row) => {
              void navigate(`/tasks/${row.id}`);
            }}
          />
        ) : null}

        {isUpdating ? (
          <p className="flex items-center gap-sm text-body-sm text-on-surface-variant">
            <Spinner size="sm" label="Updating" />
            Updating…
          </p>
        ) : null}
      </section>

      <CreateTeamTaskDialog
        open={createOpen}
        reports={reports}
        onClose={() => {
          setCreateOpen(false);
        }}
      />

      <ConfirmDialog
        open={pendingDelete != null}
        title="Remove this task from your list?"
        description="The task is soft-deleted: it leaves active lists, while audit history is retained server-side."
        confirmLabel="Remove"
        variant="destructive"
        isConfirming={isDeleting}
        onCancel={() => {
          setPendingDelete(null);
        }}
        onConfirm={() => {
          void handleConfirmDelete();
        }}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
      <p className="text-label-md uppercase tracking-wider text-on-surface-variant">
        {label}
      </p>
      <p className="mt-sm text-headline-lg text-primary">{value}</p>
      {hint ? (
        <p className="mt-xs text-body-sm text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

function FormControl({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex min-w-[220px] flex-col gap-xs">
      <span className="text-label-md uppercase tracking-wider text-on-surface-variant">
        {label}
      </span>
      {children}
    </label>
  );
}

function filterChipClass(selected: boolean): string {
  return [
    'min-h-11 rounded-lg px-md py-sm text-label-md transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    selected
      ? 'bg-secondary-container text-on-secondary-container'
      : 'text-on-surface-variant hover:bg-surface-container-high',
  ].join(' ');
}
