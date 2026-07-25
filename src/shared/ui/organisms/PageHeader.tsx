import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';

export type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
  className?: string;
};

export function PageHeader({
  title,
  description,
  actions,
  breadcrumb,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex flex-col gap-sm border-b border-outline-variant pb-md',
        className,
      )}
    >
      {breadcrumb ? (
        <div className="text-body-sm text-on-surface-variant">{breadcrumb}</div>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-md">
        <div className="flex min-w-0 flex-col gap-xs">
          <h1 className="text-headline-lg text-on-surface">{title}</h1>
          {description ? (
            <p className="text-body-md text-on-surface-variant">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-sm">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
