import { cn } from '@/shared/lib/cn';
import { TaskStatuses, type TaskStatus } from '@/shared-kernel';

export type TaskStatusFilter = 'ALL' | TaskStatus;

export type TaskFilterTabsProps = {
  value: TaskStatusFilter;
  onChange: (value: TaskStatusFilter) => void;
  counts?: Partial<Record<TaskStatusFilter, number>>;
};

const TABS: { id: TaskStatusFilter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: TaskStatuses.IN_PROGRESS, label: 'In Progress' },
  { id: TaskStatuses.DONE, label: 'Done' },
];

export function TaskFilterTabs({
  value,
  onChange,
  counts,
}: TaskFilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter tasks by status"
      className="flex flex-wrap gap-xs"
    >
      {TABS.map((tab) => {
        const selected = value === tab.id;
        const count = counts?.[tab.id];
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => {
              onChange(tab.id);
            }}
            className={cn(
              'min-h-11 rounded-lg px-md py-sm text-label-md transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              selected
                ? 'bg-secondary-container text-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-container-high',
            )}
          >
            {tab.label}
            {count != null ? (
              <span className="ml-xs opacity-80">({count})</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
