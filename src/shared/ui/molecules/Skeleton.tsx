import { cn } from '@/shared/lib/cn';

export type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-surface-container-high',
        className,
      )}
    />
  );
}

export type SkeletonRowsProps = {
  count?: number;
  className?: string;
  rowClassName?: string;
};

export function SkeletonRows({
  count = 4,
  className,
  rowClassName,
}: SkeletonRowsProps) {
  return (
    <div className={cn('flex flex-col gap-sm', className)} role="status" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton
          key={index}
          className={cn('h-10 w-full', rowClassName)}
        />
      ))}
    </div>
  );
}
