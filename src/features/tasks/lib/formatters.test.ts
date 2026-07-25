import { describe, expect, it } from 'vitest';

import {
  formatDueDate,
  isDueOverdue,
} from '@/features/tasks/lib/formatters';
import { TaskStatuses } from '@/shared-kernel';

describe('task formatters', () => {
  it('formats due dates and empty values', () => {
    expect(formatDueDate(null)).toBe('—');
    expect(formatDueDate('2026-08-24')).toMatch(/Aug/);
  });

  it('flags overdue only for in-progress past due dates', () => {
    expect(isDueOverdue('2000-01-01', TaskStatuses.IN_PROGRESS)).toBe(true);
    expect(isDueOverdue('2000-01-01', TaskStatuses.DONE)).toBe(false);
    expect(isDueOverdue(null, TaskStatuses.IN_PROGRESS)).toBe(false);
  });
});
