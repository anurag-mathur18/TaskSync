import { describe, expect, it } from 'vitest';

import { createTaskSchema, loginSchema, updateTaskSchema } from '@/shared-kernel';

describe('shared-kernel schemas', () => {
  it('rejects empty task name', () => {
    const result = createTaskSchema.safeParse({ name: '   ' });
    expect(result.success).toBe(false);
  });

  it('accepts optional description and dueDate', () => {
    const result = createTaskSchema.safeParse({
      name: 'Ship MVP',
      description: '',
      dueDate: null,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
      expect(result.data.dueDate).toBeNull();
    }
  });

  it('rejects empty update patch', () => {
    expect(updateTaskSchema.safeParse({}).success).toBe(false);
  });

  it('requires password for login', () => {
    const result = loginSchema.safeParse({
      email: 'alex@tasksync.local',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});
