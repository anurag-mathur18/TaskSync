import {
  Children,
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from 'react';

import { cn } from '@/shared/lib/cn';

export type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

type ControlProps = {
  id?: string;
  hasError?: boolean;
  required?: boolean;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
  'aria-required'?: boolean | 'true' | 'false';
};

export function FormField({
  id,
  label,
  error,
  description,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  /** Only reference IDs that are actually rendered. */
  const describedBy =
    [
      error ? errorId : null,
      description && !error ? descriptionId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const control = Children.map(children, (child) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child as ReactElement<ControlProps>, {
      id,
      hasError: Boolean(error),
      'aria-describedby': describedBy,
      'aria-invalid': error ? true : undefined,
      'aria-required': required || undefined,
    });
  });

  return (
    <div className={cn('flex flex-col gap-xs', className)}>
      <label htmlFor={id} className="text-body-sm font-medium text-on-surface">
        {label}
        {required ? (
          <span className="text-error" aria-hidden="true">
            {' '}
            *
          </span>
        ) : null}
      </label>
      {control}
      {description && !error ? (
        <p id={descriptionId} className="text-body-sm text-on-surface-variant">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-body-sm text-error">
          {error}
        </p>
      ) : null}
    </div>
  );
}
