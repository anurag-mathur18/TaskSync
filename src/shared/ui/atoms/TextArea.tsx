import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  hasError?: boolean;
};

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea({ className, hasError = false, rows = 4, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={hasError || undefined}
        className={cn(
          'w-full rounded-md border bg-surface-container-low px-3 py-2 text-body-md text-on-surface',
          'placeholder:text-on-surface-variant/70',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          hasError
            ? 'border-error focus-visible:ring-error'
            : 'border-outline-variant',
          className,
        )}
        {...props}
      />
    );
  },
);
