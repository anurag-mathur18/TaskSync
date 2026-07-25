import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router';
import { z } from 'zod';

import { useSession } from '@/features/auth';
import {
  useDeleteTaskMutation,
  useGetTaskQuery,
  useUpdateTaskMutation,
} from '@/features/tasks/api/tasksApi';
import { TaskStatusBadge } from '@/features/tasks/components/TaskStatusBadge';
import {
  formatAuditDateTime,
  formatDueDate,
} from '@/features/tasks/lib/formatters';
import { toPermissionActor } from '@/features/tasks/lib/toPermissionActor';
import {
  canCloseTask,
  canDeleteTask,
  canEditTask,
  getAllowedStatusOptions,
  isTerminalClosed,
} from '@/shared/lib/permissions';
import { Button } from '@/shared/ui/atoms/Button';
import { Select } from '@/shared/ui/atoms/Select';
import { Spinner } from '@/shared/ui/atoms/Spinner';
import { TextArea } from '@/shared/ui/atoms/TextArea';
import { TextInput } from '@/shared/ui/atoms/TextInput';
import { FormField } from '@/shared/ui/molecules/FormField';
import { ConfirmDialog, PageHeader, toast } from '@/shared/ui/organisms';
import { toastApiError } from '@/shared/lib/apiError';
import {
  TaskStatuses,
  statusLabelFor,
  type TaskStatus,
} from '@/shared-kernel';

const detailFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().max(10_000),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .or(z.literal('')),
  status: z.enum([
    TaskStatuses.IN_PROGRESS,
    TaskStatuses.DONE,
    TaskStatuses.CLOSED,
  ]),
});

type DetailFormValues = z.infer<typeof detailFormSchema>;

export function TaskDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useSession();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: task, isLoading, isError, refetch } = useGetTaskQuery(id, {
    skip: !id,
  });
  const [updateTask, { isLoading: isSaving }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();

  const actor = user ? toPermissionActor(user) : null;
  const editable = task && actor ? canEditTask(actor, task) : false;
  const deletable = task && actor ? canDeleteTask(actor, task) : false;
  const closable = task && actor ? canCloseTask(actor, task) : false;
  const closed = task ? isTerminalClosed(task) : false;
  const statusOptions = useMemo(() => {
    if (!task || !actor) return [];
    return getAllowedStatusOptions(actor, task);
  }, [actor, task]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<DetailFormValues>({
    resolver: zodResolver(detailFormSchema),
    defaultValues: {
      name: '',
      description: '',
      dueDate: '',
      status: TaskStatuses.IN_PROGRESS,
    },
  });

  useEffect(() => {
    if (!task) return;
    reset({
      name: task.name,
      description: task.description ?? '',
      dueDate: task.dueDate ?? '',
      status: task.status,
    });
  }, [task, reset]);

  async function onSave(values: DetailFormValues) {
    if (!task || !editable) return;
    try {
      await updateTask({
        id: task.id,
        patch: {
          name: values.name.trim(),
          description: values.description.trim() || null,
          dueDate: values.dueDate || null,
          status: values.status as TaskStatus,
        },
      }).unwrap();
      toast.success('Task saved');
    } catch (error) {
      toastApiError(error, 'Could not save task');
    }
  }

  async function onCloseTask() {
    if (!task) return;
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

  async function onConfirmDelete() {
    if (!task) return;
    try {
      await deleteTask(task.id).unwrap();
      toast.success('Task removed');
      void navigate('/tasks', { replace: true });
    } catch (error) {
      toastApiError(error, 'Could not delete task');
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Spinner size="md" label="Loading task" />
      </div>
    );
  }

  if (isError || !task || !actor) {
    return (
      <div className="flex flex-col items-center gap-md py-xl text-center">
        <p className="text-body-md text-error">Could not load this task.</p>
        <div className="flex gap-sm">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              void refetch();
            }}
          >
            Retry
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              void navigate('/tasks');
            }}
          >
            Back to My Tasks
          </Button>
        </div>
      </div>
    );
  }

  const showCreatedBy = task.createdBy.id !== task.owner.id;
  const truncatedName =
    task.name.length > 48 ? `${task.name.slice(0, 48)}…` : task.name;

  return (
    <div className="flex flex-col gap-lg">
      <PageHeader
        title={task.name}
        breadcrumb={
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-xs">
            <Link
              to="/tasks"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              My Tasks
            </Link>
            <span aria-hidden>/</span>
            <span className="text-on-surface">{truncatedName}</span>
          </nav>
        }
        actions={
          <div className="flex flex-wrap gap-sm">
            {closable ? (
              <Button
                type="button"
                variant="secondary"
                isLoading={isSaving}
                onClick={() => {
                  void onCloseTask();
                }}
              >
                Close task
              </Button>
            ) : null}
            {deletable ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setConfirmDelete(true);
                }}
              >
                Delete
              </Button>
            ) : null}
          </div>
        }
      />

      {closed ? (
        <p
          role="status"
          className="rounded-md border border-outline-variant bg-surface-container-low px-md py-sm text-body-sm text-on-surface-variant"
        >
          This task is Closed (terminal). Fields are read-only
          {deletable ? '; you may still remove it from active lists.' : '.'}
        </p>
      ) : null}

      <form
        className="grid grid-cols-1 gap-xl lg:grid-cols-[minmax(0,1fr)_280px]"
        onSubmit={(event) => {
          void handleSubmit(onSave)(event);
        }}
      >
        <div className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <FormField
            id="task-name"
            label="Name"
            required
            error={errors.name?.message}
          >
            <TextInput
              disabled={!editable || isSaving}
              {...register('name')}
            />
          </FormField>

          <FormField
            id="task-description"
            label="Description"
            error={errors.description?.message}
          >
            <TextArea
              rows={6}
              disabled={!editable || isSaving}
              {...register('description')}
            />
          </FormField>

          <div className="flex flex-wrap justify-end gap-sm border-t border-outline-variant pt-md">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                void navigate('/tasks');
              }}
            >
              Cancel
            </Button>
            {editable ? (
              <Button
                type="submit"
                isLoading={isSaving}
                disabled={!isDirty || isSaving}
              >
                Save changes
              </Button>
            ) : null}
          </div>
        </div>

        <aside className="flex flex-col gap-md rounded-xl border border-outline-variant bg-surface-container-lowest p-lg">
          <div className="flex flex-col gap-xs">
            <label
              htmlFor="task-status"
              className="text-label-md uppercase tracking-wider text-on-surface-variant"
            >
              Status
            </label>
            {closed || statusOptions.length === 0 ? (
              <TaskStatusBadge status={task.status} />
            ) : (
              <Select
                id="task-status"
                disabled={!editable || isSaving}
                {...register('status')}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {statusLabelFor(status)}
                  </option>
                ))}
              </Select>
            )}
          </div>

          <FormField
            id="task-due"
            label="Due date"
            error={errors.dueDate?.message}
          >
            <TextInput
              type="date"
              disabled={!editable || isSaving}
              {...register('dueDate')}
            />
          </FormField>

          <dl className="flex flex-col gap-sm border-t border-outline-variant pt-md text-body-sm">
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                Owner
              </dt>
              <dd className="mt-xs text-on-surface">{task.owner.fullName}</dd>
            </div>
            {showCreatedBy ? (
              <div>
                <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                  Created by
                </dt>
                <dd className="mt-xs text-on-surface">
                  {task.createdBy.fullName}
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                Date created
              </dt>
              <dd className="mt-xs font-mono text-label-md text-on-surface">
                {formatAuditDateTime(task.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                Date modified
              </dt>
              <dd className="mt-xs font-mono text-label-md text-on-surface">
                {formatAuditDateTime(task.updatedAt)}
              </dd>
            </div>
            <div>
              <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                Last modified by
              </dt>
              <dd className="mt-xs text-on-surface">
                {task.lastModifiedBy.fullName}
              </dd>
            </div>
            {task.dueDate ? (
              <div>
                <dt className="text-label-md uppercase tracking-wider text-on-surface-variant">
                  Due (display)
                </dt>
                <dd className="mt-xs text-on-surface">
                  {formatDueDate(task.dueDate)}
                </dd>
              </div>
            ) : null}
          </dl>
        </aside>
      </form>

      <ConfirmDialog
        open={confirmDelete}
        title="Remove this task from your list?"
        description="The task is soft-deleted: it leaves active lists, while audit history is retained server-side."
        confirmLabel="Remove"
        variant="destructive"
        isConfirming={isDeleting}
        onCancel={() => {
          setConfirmDelete(false);
        }}
        onConfirm={() => {
          void onConfirmDelete();
        }}
      />
    </div>
  );
}
