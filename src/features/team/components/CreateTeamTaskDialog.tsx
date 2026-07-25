import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { useCreateTaskMutation } from '@/features/tasks';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/atoms/Button';
import { Select } from '@/shared/ui/atoms/Select';
import { TextArea } from '@/shared/ui/atoms/TextArea';
import { TextInput } from '@/shared/ui/atoms/TextInput';
import { FormField } from '@/shared/ui/molecules/FormField';
import { toast } from '@/shared/ui/organisms';
import { toastApiError } from '@/shared/lib/apiError';
import type { CreateTaskInput, UserSummary } from '@/shared-kernel';

export type CreateTeamTaskDialogProps = {
  open: boolean;
  onClose: () => void;
  reports: UserSummary[];
};

const formSchema = z.object({
  ownerId: z.string().uuid('Select a team member'),
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z.string().max(10_000).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD')
    .or(z.literal(''))
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CreateTeamTaskDialog({
  open,
  onClose,
  reports,
}: CreateTeamTaskDialogProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerId: reports[0]?.id ?? '',
      name: '',
      description: '',
      dueDate: '',
    },
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
    if (!open) return;
    reset({
      ownerId: reports[0]?.id ?? '',
      name: '',
      description: '',
      dueDate: '',
    });
  }, [open, reports, reset]);

  async function onSubmit(values: FormValues) {
    const payload: CreateTaskInput = {
      name: values.name.trim(),
      description: values.description?.trim() ? values.description.trim() : null,
      dueDate: values.dueDate ? values.dueDate : null,
      ownerId: values.ownerId,
    };

    try {
      await createTask(payload).unwrap();
      toast.success('Task created for team member');
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
            Create for team member
          </h2>
          <p className="mt-xs text-body-sm text-on-surface-variant">
            Owner must be one of your direct reports.
          </p>
        </div>

        <FormField
          id="team-task-owner"
          label="Assignee"
          required
          error={errors.ownerId?.message}
        >
          <Select disabled={isLoading || reports.length === 0} {...register('ownerId')}>
            {reports.length === 0 ? (
              <option value="">No direct reports</option>
            ) : (
              reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {report.fullName}
                </option>
              ))
            )}
          </Select>
        </FormField>

        <FormField
          id="team-task-name"
          label="Name"
          required
          error={errors.name?.message}
        >
          <TextInput
            disabled={isLoading}
            placeholder="What should they work on?"
            {...register('name')}
          />
        </FormField>

        <FormField
          id="team-task-description"
          label="Description"
          error={errors.description?.message}
        >
          <TextArea
            rows={3}
            disabled={isLoading}
            placeholder="Optional context"
            {...register('description')}
          />
        </FormField>

        <FormField
          id="team-task-due"
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
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={reports.length === 0}
          >
            Create task
          </Button>
        </div>
      </form>
    </dialog>
  );
}
