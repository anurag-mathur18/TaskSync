import { z } from 'zod';

import { rolesSchema } from './role';

export const updateRolesSchema = z.object({
  roles: rolesSchema,
});

export type UpdateRolesInput = z.infer<typeof updateRolesSchema>;

export const setManagerSchema = z.object({
  managerId: z.string().uuid().nullable(),
});

export type SetManagerInput = z.infer<typeof setManagerSchema>;
