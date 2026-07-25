import { cn } from '@/shared/lib/cn';

export type SpinnerProps = {
  className?: string;
  size?: 'sm' | 'md';
  label?: string;
};

const sizeClass = {
  sm: 'size-4 border-2',
  md: 'size-5 border-2',
} as const;

export function Spinner({
  className,
  size = 'sm',
  label = 'Loading',
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn(
        'inline-block animate-spin rounded-full border-current border-r-transparent',
        sizeClass[size],
        className,
      )}
    />
  );
}
