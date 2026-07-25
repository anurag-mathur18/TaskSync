import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button';

export type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export function EmptyState({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-md px-md py-xl text-center',
        className,
      )}
    >
      {icon ? (
        <div className="text-outline" aria-hidden="true">
          {icon}
        </div>
      ) : null}
      <div className="flex max-w-md flex-col gap-xs">
        <h2 className="text-headline-md text-on-surface">{title}</h2>
        {description ? (
          <p className="text-body-md text-on-surface-variant">{description}</p>
        ) : null}
      </div>
      {actionLabel && onAction ? (
        <Button type="button" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
