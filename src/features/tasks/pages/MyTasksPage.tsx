import { ClipboardList, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useSession } from '@/features/auth';
import {
  useDeleteTaskMutation,
  useGetMyTasksQuery,
  useUpdateTaskMutation,
} from '@/features/tasks/api/tasksApi';
import { CreateTaskDialog } from '@/features/tasks/components/CreateTaskDialog';
import {
  TaskFilterTabs,
  type TaskStatusFilter,
} from '@/features/tasks/components/TaskFilterTabs';
import { TaskRow } from '@/features/tasks/components/TaskRow';
import { toPermissionActor } from '@/features/tasks/lib/toPermissionActor';
import { Button } from '@/shared/ui/atoms/Button';
import { EmptyState } from '@/shared/ui/molecules/EmptyState';
import { SkeletonRows } from '@/shared/ui/molecules/Skeleton';
import { ConfirmDialog, toast } from '@/shared/ui/organisms';
import { toastApiError } from '@/shared/lib/apiError';
import { TaskStatuses, type TaskDto } from '@/shared-kernel';

export function MyTasksPage() {
  const { user } = useSession();
  const [filter, setFilter] = useState<TaskStatusFilter>('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<TaskDto | null>(null);

  const listArgs = useMemo(
    () => ({
      status: filter === 'ALL' ? undefined : filter,
      includeClosed: false,
      pageSize: 50,
    }),
    [filter],
  );

  const { data, isLoading, isError, isFetching, refetch } =
    useGetMyTasksQuery(listArgs);
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  if (!user) return null;

  const actor = toPermissionActor(user);
  const firstName = user.fullName.split(' ')[0] ?? user.fullName;
  const tasks = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const doneCount = tasks.filter((t) => t.status === TaskStatuses.DONE).length;

  async function handleToggleDone(task: TaskDto) {
    const next =
      task.status === TaskStatuses.DONE
        ? TaskStatuses.IN_PROGRESS
        : TaskStatuses.DONE;
    try {
      await updateTask({ id: task.id, patch: { status: next } }).unwrap();
    } catch (error) {
      toastApiError(error, 'Could not update status');
    }
  }

  async function handleClose(task: TaskDto) {
    try {
      await updateTask({
        id: task.id,
        patch: { status: TaskStatuses.CLOSED },
      }).unwrap();
      toast.success('Task closed');
    } catch (error) {
      toastApiError(error, 'Could not close task');
    }
  }

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

  return (
    <div className="flex flex-col gap-xl">
      <section className="grid grid-cols-1 gap-lg lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-primary-container p-xl text-on-primary lg:col-span-2">
          <h1 className="text-display">Hello, {firstName}</h1>
          <p className="mt-sm max-w-md text-body-lg opacity-90">
            {isLoading
              ? 'Loading your tasks…'
              : total === 0
                ? 'No open tasks right now. Create one to get started.'
                : `You have ${total} open task${total === 1 ? '' : 's'}. Keep momentum on what matters today.`}
          </p>
          <div className="mt-lg">
            <Button
              type="button"
              variant="secondary"
              className="bg-surface-container-lowest text-primary hover:bg-white"
              onClick={() => {
                setCreateOpen(true);
              }}
            >
              <Plus className="size-4" aria-hidden />
              New task
            </Button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest p-xl text-center">
          <p className="text-display text-primary">
            {isLoading ? '—' : `${doneCount}`}
          </p>
          <h2 className="mt-sm text-headline-md text-on-surface">Done</h2>
          <p className="mt-xs text-body-sm text-on-surface-variant">
            {isLoading
              ? 'Counting completions…'
              : `of ${total} in this view`}
          </p>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <div className="flex flex-col gap-md border-b border-outline-variant bg-surface-container-low p-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-md">
            <h2 className="text-headline-md">My Tasks</h2>
            {!isLoading ? (
              <span className="rounded-full bg-secondary-container px-sm py-xs text-label-sm text-on-secondary-container">
                {total} active
              </span>
            ) : null}
          </div>
          <TaskFilterTabs value={filter} onChange={setFilter} />
        </div>

        {isError ? (
          <div className="flex flex-col items-center gap-md px-md py-xl text-center">
            <p className="text-body-md text-error">
              Could not load your tasks.
            </p>
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

        {!isError && (isLoading || (isFetching && !data)) ? (
          <div className="p-md">
            <SkeletonRows count={5} rowClassName="h-12" />
          </div>
        ) : null}

        {!isError && !isLoading && tasks.length === 0 ? (
          <EmptyState
            icon={<ClipboardList className="size-10" aria-hidden />}
            title="No tasks yet"
            description="Create a task to track work through In Progress and Done."
            actionLabel="New task"
            onAction={() => {
              setCreateOpen(true);
            }}
          />
        ) : null}

        {!isError && tasks.length > 0 ? (
          <div>
            <div className="hidden grid-cols-[44px_1fr_120px_140px_auto] border-b border-outline-variant px-md py-sm md:grid">
              <span className="sr-only">Complete</span>
              <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                Task name
              </span>
              <span className="text-center text-label-sm uppercase tracking-wider text-on-surface-variant">
                Status
              </span>
              <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
                Due date
              </span>
              <span className="sr-only">Actions</span>
            </div>
            {tasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                actor={actor}
                isUpdating={isUpdating}
                onToggleDone={(t) => {
                  void handleToggleDone(t);
                }}
                onClose={(t) => {
                  void handleClose(t);
                }}
                onDelete={setPendingDelete}
              />
            ))}
          </div>
        ) : null}
      </section>

      <Button
        type="button"
        aria-label="New task"
        className="fixed bottom-20 right-margin-mobile z-40 size-14 min-h-14 min-w-14 rounded-full p-0 shadow-modal md:hidden"
        onClick={() => {
          setCreateOpen(true);
        }}
      >
        <Plus className="size-6" aria-hidden />
      </Button>

      <CreateTaskDialog
        open={createOpen}
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
