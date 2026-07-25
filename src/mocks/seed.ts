import {
  Roles,
  TaskStatuses,
  type Role,
  type TaskStatus,
} from '@/shared-kernel';

/** Deterministic local-only password for all seed users. */
export const SEED_PASSWORD = 'Password123!';

export const ORG_ID = '00000000-0000-4000-8000-000000000001';

export const SEED_USER_IDS = {
  admin: '11111111-1111-4111-8111-111111111111',
  manager: '22222222-2222-4222-8222-222222222222',
  alex: '33333333-3333-4333-8333-333333333333',
  sam: '44444444-4444-4444-8444-444444444444',
  outsider: '55555555-5555-4555-8555-555555555555',
} as const;

export const SEED_TASK_IDS = {
  alexInProgress: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  alexDone: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  samDone: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  managerOwn: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  outsiderTask: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  alexClosed: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
} as const;

export type SeedUserRecord = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  roles: Role[];
  managerId: string | null;
  orgId: string;
};

export type SeedTaskRecord = {
  id: string;
  name: string;
  description: string | null;
  dueDate: string | null;
  status: TaskStatus;
  ownerId: string;
  createdById: string;
  lastModifiedById: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export function createSeedUsers(): SeedUserRecord[] {
  return [
    {
      id: SEED_USER_IDS.admin,
      email: 'admin@tasksync.local',
      password: SEED_PASSWORD,
      fullName: 'Ada Admin',
      roles: [Roles.ADMIN],
      managerId: null,
      orgId: ORG_ID,
    },
    {
      id: SEED_USER_IDS.manager,
      email: 'manager@tasksync.local',
      password: SEED_PASSWORD,
      fullName: 'Morgan Manager',
      roles: [Roles.MANAGER, Roles.EMPLOYEE],
      managerId: null,
      orgId: ORG_ID,
    },
    {
      id: SEED_USER_IDS.alex,
      email: 'alex@tasksync.local',
      password: SEED_PASSWORD,
      fullName: 'Alex Employee',
      roles: [Roles.EMPLOYEE],
      managerId: SEED_USER_IDS.manager,
      orgId: ORG_ID,
    },
    {
      id: SEED_USER_IDS.sam,
      email: 'sam@tasksync.local',
      password: SEED_PASSWORD,
      fullName: 'Sam Employee',
      roles: [Roles.EMPLOYEE],
      managerId: SEED_USER_IDS.manager,
      orgId: ORG_ID,
    },
    {
      id: SEED_USER_IDS.outsider,
      email: 'outsider@tasksync.local',
      password: SEED_PASSWORD,
      fullName: 'Olivia Outsider',
      roles: [Roles.EMPLOYEE],
      managerId: null,
      orgId: ORG_ID,
    },
  ];
}

export function createSeedTasks(): SeedTaskRecord[] {
  const now = '2026-07-01T10:00:00.000Z';

  return [
    {
      id: SEED_TASK_IDS.alexInProgress,
      name: 'Draft Q3 roadmap',
      description: 'Outline milestones for product launch.',
      dueDate: '2026-08-15',
      status: TaskStatuses.IN_PROGRESS,
      ownerId: SEED_USER_IDS.alex,
      createdById: SEED_USER_IDS.alex,
      lastModifiedById: SEED_USER_IDS.alex,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: SEED_TASK_IDS.alexDone,
      name: 'Prepare demo script',
      description: 'Ready for manager review.',
      dueDate: '2026-07-20',
      status: TaskStatuses.DONE,
      ownerId: SEED_USER_IDS.alex,
      createdById: SEED_USER_IDS.alex,
      lastModifiedById: SEED_USER_IDS.alex,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: SEED_TASK_IDS.samDone,
      name: 'Update team wiki',
      description: null,
      dueDate: null,
      status: TaskStatuses.DONE,
      ownerId: SEED_USER_IDS.sam,
      createdById: SEED_USER_IDS.sam,
      lastModifiedById: SEED_USER_IDS.sam,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: SEED_TASK_IDS.managerOwn,
      name: 'Plan 1:1 agenda',
      description: 'Manager own task.',
      dueDate: '2026-07-30',
      status: TaskStatuses.IN_PROGRESS,
      ownerId: SEED_USER_IDS.manager,
      createdById: SEED_USER_IDS.manager,
      lastModifiedById: SEED_USER_IDS.manager,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: SEED_TASK_IDS.outsiderTask,
      name: 'Outsider private work',
      description: 'Should be invisible to manager.',
      dueDate: null,
      status: TaskStatuses.IN_PROGRESS,
      ownerId: SEED_USER_IDS.outsider,
      createdById: SEED_USER_IDS.outsider,
      lastModifiedById: SEED_USER_IDS.outsider,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      id: SEED_TASK_IDS.alexClosed,
      name: 'Closed onboarding checklist',
      description: 'Already closed by manager.',
      dueDate: '2026-06-01',
      status: TaskStatuses.CLOSED,
      ownerId: SEED_USER_IDS.alex,
      createdById: SEED_USER_IDS.alex,
      lastModifiedById: SEED_USER_IDS.manager,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];
}
