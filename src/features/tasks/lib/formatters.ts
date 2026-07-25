import { TaskStatuses, type TaskStatus } from '@/shared-kernel';

/** Format API due date `YYYY-MM-DD` for list/detail display. */
export function formatDueDate(dueDate: string | null): string {
  if (!dueDate) return '—';
  const date = new Date(`${dueDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dueDate;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatAuditDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function isDueOverdue(
  dueDate: string | null,
  status: TaskStatus,
): boolean {
  if (!dueDate || status !== TaskStatuses.IN_PROGRESS) return false;
  const due = new Date(`${dueDate}T23:59:59`);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}
