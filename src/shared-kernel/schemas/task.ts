import { z } from 'zod';

import { taskStatusSchema } from './task-status';
import { userSummarySchema } from './user';

export const taskDtoSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
  status: taskStatusSchema,
  statusLabel: z.enum(['In Progress', 'Done', 'Closed']),
  owner: userSummarySchema,
  createdBy: userSummarySchema,
  lastModifiedBy: userSummarySchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type TaskDto = z.infer<typeof taskDtoSchema>;

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(200),
  description: z
    .string()
    .max(10_000)
    .optional()
    .nullable()
    .transform((value) => {
      if (value == null || value.trim() === '') return null;
      return value;
    }),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
    .nullable()
    .transform((value) => value ?? null),
  ownerId: z.string().uuid().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    name: z.string().trim().min(1).max(200).optional(),
    description: z.string().max(10_000).nullable().optional(),
    dueDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable()
      .optional(),
    status: taskStatusSchema.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required',
  });

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export const taskListMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});

export const taskListResponseSchema = z.object({
  data: z.array(taskDtoSchema),
  meta: taskListMetaSchema,
});

export type TaskListResponse = z.infer<typeof taskListResponseSchema>;
