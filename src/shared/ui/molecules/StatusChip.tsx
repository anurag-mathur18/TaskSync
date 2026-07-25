import { cn } from '@/shared/lib/cn';

export type StatusChipTone =
  | 'inProgress'
  | 'done'
  | 'closed'
  | 'overdue'
  | 'neutral';

export type StatusChipProps = {
  /** Visible text required — color alone must not convey status (WCAG 1.4.1). */
  label: string;
  tone?: StatusChipTone;
  className?: string;
};

const toneClass: Record<StatusChipTone, string> = {
  inProgress:
    'border-primary bg-tertiary-fixed text-tertiary',
  done: 'border-status-done/30 bg-status-done-container text-status-done',
  closed:
    'border-outline-variant bg-status-closed-container text-status-closed',
  overdue: 'border-error/40 bg-error-container text-error',
  neutral:
    'border-outline-variant bg-surface-container-low text-on-surface-variant',
};

export function StatusChip({
  label,
  tone = 'neutral',
  className,
}: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-sm py-xs text-label-sm uppercase',
        toneClass[tone],
        className,
      )}
    >
      {/* Text label is required — status must never be color-only (WCAG 1.4.1). */}
      {label}
    </span>
  );
}
