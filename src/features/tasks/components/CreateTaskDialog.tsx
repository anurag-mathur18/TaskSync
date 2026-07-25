import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCreateTaskMutation } from '@/features/tasks/api/tasksApi';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button';
import { TextArea } from '@/shared/ui/atoms/TextArea';
import { TextInput } from '@/shared/ui/atoms/TextInput';
import { FormField } from '@/shared/ui/molecules/FormField';
import { toast } from '@/shared/ui/organisms';
import { toastApiError } from '@/shared/lib/apiError';
import type { CreateTaskInput } from '@/shared-kernel';

export type CreateTaskDialogProps = {
  open: boolean;
  onClose: () => void;
};

const createTaskFormSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().max(10_000).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .or(z.literal(''))
    .optional(),
});

type CreateTaskFormValues = z.infer<typeof createTaskFormSchema>;

export function CreateTaskDialog({ open, onClose }: CreateTaskDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskFormSchema),
    defaultValues: { name: '', description: '', dueDate: '' },
    mode: 'onBlur',
  });

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) dialog.showModal();
      return;
    }
    if (dialog.open) dialog.close();
    previouslyFocused.current?.focus?.();
  }, [open]);

  useEffect(() => {
    if (!open) reset({ name: '', description: '', dueDate: '' });
  }, [open, reset]);

  async function onSubmit(values: CreateTaskFormValues) {
    const payload: CreateTaskInput = {
      name: values.name.trim(),
      description: values.description?.trim() ? values.description.trim() : null,
      dueDate: values.dueDate ? values.dueDate : null,
    };

    try {
      await createTask(payload).unwrap();
      toast.success('Task created');
      onClose();
    } catch (error) {
      toastApiError(error, 'Could not create task');
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(
        'fixed inset-0 z-50 m-auto max-h-[calc(100%-2rem)] w-[min(100%-2rem,28rem)] rounded-xl border border-outline-variant bg-surface-container-lowest p-0 shadow-modal',
        'backdrop:bg-on-surface/40',
        'max-md:mb-0 max-md:mt-auto max-md:w-full max-md:max-w-none max-md:rounded-b-none max-md:rounded-t-xl',
      )}
      onClose={onClose}
      onCancel={(event) => {
        event.preventDefault();
        if (!isLoading) onClose();
      }}
    >
      <form
        className="flex flex-col gap-lg p-lg"
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
      >
        <div>
          <h2 id={titleId} className="text-headline-md text-on-surface">
            New task
          </h2>
          <p className="mt-xs text-body-sm text-on-surface-variant">
            Name is required. Description and due date are optional.
          </p>
        </div>

        <FormField
          id="create-task-name"
          label="Name"
          required
          error={errors.name?.message}
        >
          <TextInput
            autoFocus
            disabled={isLoading}
            placeholder="What needs to get done?"
            {...register('name')}
          />
        </FormField>

        <FormField
          id="create-task-description"
          label="Description"
          error={errors.description?.message}
        >
          <TextArea
            disabled={isLoading}
            rows={3}
            placeholder="Optional context"
            {...register('description')}
          />
        </FormField>

        <FormField
          id="create-task-due"
          label="Due date"
          error={errors.dueDate?.message}
        >
          <TextInput type="date" disabled={isLoading} {...register('dueDate')} />
        </FormField>

        <div className="flex justify-end gap-sm">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={isLoading}>
            Create task
          </Button>
        </div>
      </form>
    </dialog>
  );
}
