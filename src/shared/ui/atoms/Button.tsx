import { motion, type HTMLMotionProps } from 'motion/react';
import { forwardRef, type ReactNode } from 'react';

import { cn } from '@/shared/lib/cn';
import { Spinner } from '@/shared/ui/atoms/Spinner';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children?: ReactNode;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-container disabled:bg-primary/40',
  secondary:
    'bg-secondary-container text-on-secondary-container hover:bg-surface-container-high disabled:opacity-50',
  outline:
    'border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low disabled:opacity-50',
  ghost:
    'bg-transparent text-primary hover:bg-primary/5 disabled:opacity-50',
  destructive:
    'bg-error text-on-error hover:bg-on-error-container disabled:bg-error/40',
};

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-9 min-h-9 gap-1.5 px-3 text-body-sm md:h-8 md:min-h-8',
  md: 'h-11 min-h-11 gap-2 px-4 text-body-md',
  lg: 'h-11 min-h-11 gap-2 px-5 text-body-lg',
};

/** M1 — `whileTap` scale 0.95, 150ms (FE PRD §11). */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      children,
      type = 'button',
      whileTap,
      transition,
      ...props
    },
    ref,
  ) {
    const isDisabled = Boolean(disabled || isLoading);

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        whileTap={isDisabled ? undefined : (whileTap ?? { scale: 0.95 })}
        transition={transition ?? { duration: 0.15 }}
        className={cn(
          'inline-flex items-center justify-center rounded-md font-medium',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          'disabled:pointer-events-none',
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        {...props}
      >
        {isLoading ? <Spinner className="shrink-0" /> : null}
        {children}
      </motion.button>
    );
  },
);
