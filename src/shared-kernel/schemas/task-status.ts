import { z } from 'zod';

export const TaskStatuses = {
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CLOSED: 'CLOSED',
} as const;

export type TaskStatus = (typeof TaskStatuses)[keyof typeof TaskStatuses];

export const taskStatusSchema = z.enum([
  TaskStatuses.IN_PROGRESS,
  TaskStatuses.DONE,
  TaskStatuses.CLOSED,
]);

export const TaskStatusLabels = {
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
  CLOSED: 'Closed',
} as const;

export type TaskStatusLabel =
  (typeof TaskStatusLabels)[keyof typeof TaskStatusLabels];

export function statusLabelFor(status: TaskStatus): TaskStatusLabel {
  return TaskStatusLabels[status];
}
