import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/shared/lib/cn';

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean;
};

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput({ className, hasError = false, type = 'text', ...props }, ref) {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={hasError || undefined}
        className={cn(
          'h-10 w-full rounded-md border bg-surface-container-low px-3 text-body-md text-on-surface',
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
