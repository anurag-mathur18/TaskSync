import { z } from 'zod';

import { roleSchema } from './role';

export const userSummarySchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1),
  email: z.email(),
});

export type UserSummary = z.infer<typeof userSummarySchema>;

export const userDtoSchema = z.object({
  id: z.string().uuid(),
  email: z.email(),
  fullName: z.string().min(1),
  roles: z.array(roleSchema).min(1),
  managerId: z.string().uuid().nullable(),
  reportIds: z.array(z.string().uuid()).optional(),
  orgId: z.string().uuid(),
});

export type UserDto = z.infer<typeof userDtoSchema>;

export const adminUserDtoSchema = userDtoSchema.extend({
  manager: userSummarySchema.nullable(),
});

export type AdminUserDto = z.infer<typeof adminUserDtoSchema>;
