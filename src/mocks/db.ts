import {
  createSeedTasks,
  createSeedUsers,
  type SeedTaskRecord,
  type SeedUserRecord,
} from '@/mocks/seed';

export type MockDb = {
  users: SeedUserRecord[];
  tasks: SeedTaskRecord[];
  /** token → userId */
  sessions: Map<string, string>;
};

let db: MockDb = createFreshDb();

export function createFreshDb(): MockDb {
  return {
    users: createSeedUsers(),
    tasks: createSeedTasks(),
    sessions: new Map(),
  };
}

export function getDb(): MockDb {
  return db;
}

/** Reset in-memory store to seed (tests). */
export function resetDb(): void {
  db = createFreshDb();
}

export function findUserById(id: string): SeedUserRecord | undefined {
  return db.users.find((user) => user.id === id);
}

export function findUserByEmail(email: string): SeedUserRecord | undefined {
  return db.users.find(
    (user) => user.email.toLowerCase() === email.toLowerCase(),
  );
}

export function findTaskById(id: string): SeedTaskRecord | undefined {
  return db.tasks.find((task) => task.id === id);
}

export function getDirectReportIds(managerId: string): string[] {
  return db.users
    .filter((user) => user.managerId === managerId)
    .map((user) => user.id);
}
