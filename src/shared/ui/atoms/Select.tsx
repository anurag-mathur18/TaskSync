import { forwardRef, type SelectHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  hasError?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select({ className, hasError = false, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        aria-invalid={hasError || undefined}
        className={cn(
          'h-10 w-full appearance-none rounded-md border bg-surface-container-low px-3 text-body-md text-on-surface',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-error focus-visible:ring-error'
            : 'border-outline-variant',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    );
  },
);
