import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { TaskStatusBadge } from '@/features/tasks/components/TaskStatusBadge';
import { TaskStatuses } from '@/shared-kernel';

describe('TaskStatusBadge', () => {
  it('maps statuses to design labels', () => {
    const { rerender } = render(
      <TaskStatusBadge status={TaskStatuses.IN_PROGRESS} />,
    );
    expect(screen.getByText('In Progress')).toBeInTheDocument();

    rerender(<TaskStatusBadge status={TaskStatuses.DONE} />);
    expect(screen.getByText('Done')).toBeInTheDocument();

    rerender(<TaskStatusBadge status={TaskStatuses.CLOSED} />);
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });
});
