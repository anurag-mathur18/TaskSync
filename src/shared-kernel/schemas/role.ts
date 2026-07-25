import { z } from 'zod';

export const Roles = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN',
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];

export const roleSchema = z.enum([
  Roles.EMPLOYEE,
  Roles.MANAGER,
  Roles.ADMIN,
]);

export const rolesSchema = z.array(roleSchema).min(1);
