import { Check, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';

import {
  formatDueDate,
  isDueOverdue,
} from '@/features/tasks/lib/formatters';
import { TaskStatusBadge } from '@/features/tasks/components/TaskStatusBadge';
import {
  canCloseTask,
  canDeleteTask,
  canEditTask,
  type PermissionActor,
} from '@/shared/lib/permissions';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button';
import { TaskStatuses, type TaskDto } from '@/shared-kernel';

export type TaskRowProps = {
  task: TaskDto;
  actor: PermissionActor;
  onToggleDone: (task: TaskDto) => void;
  onClose?: (task: TaskDto) => void;
  onDelete?: (task: TaskDto) => void;
  isUpdating?: boolean;
};

export function TaskRow({
  task,
  actor,
  onToggleDone,
  onClose,
  onDelete,
  isUpdating = false,
}: TaskRowProps) {
  const editable = canEditTask(actor, task);
  const deletable = canDeleteTask(actor, task);
  const closable = canCloseTask(actor, task);
  const overdue = isDueOverdue(task.dueDate, task.status);
  const isDone = task.status === TaskStatuses.DONE;
  const isClosed = task.status === TaskStatuses.CLOSED;
  const isComplete = isDone || isClosed;

  return (
    <div
      className={cn(
        'group grid grid-cols-[44px_1fr_auto] items-center gap-sm border-b border-outline-variant px-md',
        'min-h-12 transition-colors duration-150 ease-in-out hover:bg-primary/5 md:grid-cols-[44px_1fr_120px_140px_auto]',
        isClosed && 'opacity-70',
      )}
    >
      <div className="flex min-h-11 min-w-11 items-center justify-center">
        <motion.button
          type="button"
          disabled={!editable || isUpdating || isClosed}
          aria-label={
            isComplete ? 'Mark as in progress' : 'Mark as done'
          }
          aria-pressed={isComplete}
          onClick={() => {
            onToggleDone(task);
          }}
          initial={false}
          animate={
            isComplete
              ? {
                  scale: [1, 1.2, 1],
                  backgroundColor: '#1b5e20',
                  borderColor: '#1b5e20',
                }
              : {
                  scale: 1,
                  backgroundColor: 'rgba(0,0,0,0)',
                  borderColor: overdue ? '#ba1a1a' : '#737685',
                }
          }
          transition={{ duration: 0.2 }}
          className={cn(
            'flex size-4 items-center justify-center rounded-sm border-2',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed',
            isComplete ? 'text-on-primary' : 'bg-transparent',
          )}
        >
          {isComplete ? (
            <Check className="size-3" strokeWidth={3} aria-hidden />
          ) : null}
        </motion.button>
      </div>

      <Link
        to={`/tasks/${task.id}`}
        className={cn(
          'min-w-0 truncate text-body-md font-medium text-on-surface',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          (isDone || isClosed) && 'line-through',
        )}
      >
        {task.name}
      </Link>

      <div className="hidden justify-center md:flex">
        <TaskStatusBadge status={task.status} />
      </div>

      <div
        className={cn(
          'hidden text-body-sm md:block',
          overdue ? 'font-semibold text-error' : 'text-on-surface-variant',
        )}
      >
        {overdue && task.dueDate ? 'Overdue' : formatDueDate(task.dueDate)}
      </div>

      <div className="flex items-center justify-end gap-xs">
        {closable && onClose ? (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isUpdating}
            className="hidden min-h-11 sm:inline-flex"
            onClick={() => {
              onClose(task);
            }}
          >
            Close
          </Button>
        ) : null}
        {deletable && onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isUpdating}
            aria-label={`Delete ${task.name}`}
            className="min-h-11 min-w-11 text-on-surface-variant hover:text-error"
            onClick={() => {
              onDelete(task);
            }}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        ) : null}
        <Link
          to={`/tasks/${task.id}`}
          aria-label={`Open ${task.name}`}
          className="flex min-h-11 min-w-11 items-center justify-center text-outline transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
