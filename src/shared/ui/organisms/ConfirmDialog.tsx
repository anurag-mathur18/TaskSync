import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button';

export type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'destructive';
  isConfirming?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  isConfirming = false,
  onConfirm,
  onCancel,
  className,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) {
        dialog.showModal();
      }
      return;
    }

    if (dialog.open) {
      dialog.close();
    }
    previouslyFocused.current?.focus?.();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleCancel = (event: Event) => {
      event.preventDefault();
      onCancel();
    };

    dialog.addEventListener('cancel', handleCancel);
    return () => dialog.removeEventListener('cancel', handleCancel);
  }, [onCancel]);

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      className={cn(
        'fixed inset-0 m-auto max-h-[calc(100%-2rem)] w-[min(100%-2rem,28rem)] rounded-lg border border-outline-variant bg-surface-container-lowest p-0 shadow-modal',
        'backdrop:bg-on-surface/40',
        className,
      )}
    >
      <div className="flex flex-col gap-md p-lg">
        <div className="flex flex-col gap-xs">
          <h2 id={titleId} className="text-headline-md text-on-surface">
            {title}
          </h2>
          {description ? (
            <div
              id={descriptionId}
              className="text-body-md text-on-surface-variant"
            >
              {description}
            </div>
          ) : null}
        </div>
        <div className="flex justify-end gap-sm">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === 'destructive' ? 'destructive' : 'primary'}
            onClick={onConfirm}
            isLoading={isConfirming}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
