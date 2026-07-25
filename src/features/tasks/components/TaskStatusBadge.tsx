import { StatusChip, type StatusChipTone } from '@/shared/ui/molecules/StatusChip';
import {
  TaskStatuses,
  statusLabelFor,
  type TaskStatus,
} from '@/shared-kernel';

export type TaskStatusBadgeProps = {
  status: TaskStatus;
  className?: string;
};

function toneForStatus(status: TaskStatus): StatusChipTone {
  switch (status) {
    case TaskStatuses.IN_PROGRESS:
      return 'inProgress';
    case TaskStatuses.DONE:
      return 'done';
    case TaskStatuses.CLOSED:
      return 'closed';
    default:
      return 'neutral';
  }
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  return (
    <StatusChip
      label={statusLabelFor(status)}
      tone={toneForStatus(status)}
      className={className}
    />
  );
}
