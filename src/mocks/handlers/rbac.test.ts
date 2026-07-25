import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { resetDb } from '@/mocks/db';
import { server } from '@/mocks/server';
import {
  SEED_PASSWORD,
  SEED_TASK_IDS,
  SEED_USER_IDS,
} from '@/mocks/seed';

const API = '/api/v1';

async function login(email: string): Promise<string> {
  const response = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: SEED_PASSWORD }),
  });
  expect(response.status).toBe(200);
  const body = (await response.json()) as { accessToken: string };
  return body.accessToken;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

describe('MSW RBAC handlers', () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
  });

  afterEach(() => {
    server.resetHandlers();
    resetDb();
  });

  afterAll(() => {
    server.close();
  });

  it('denies Employee closing a Done task (403)', async () => {
    const token = await login('alex@tasksync.local');
    const response = await fetch(
      `${API}/tasks/${SEED_TASK_IDS.alexDone}`,
      {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ status: 'CLOSED' }),
      },
    );

    expect(response.status).toBe(403);
    const body = (await response.json()) as {
      error: { code: string };
    };
    expect(body.error.code).toBe('RBAC_DENIED');
  });

  it('allows Manager to close a report Done task', async () => {
    const token = await login('manager@tasksync.local');
    const response = await fetch(
      `${API}/tasks/${SEED_TASK_IDS.alexDone}`,
      {
        method: 'PATCH',
        headers: authHeaders(token),
        body: JSON.stringify({ status: 'CLOSED' }),
      },
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as { status: string };
    expect(body.status).toBe('CLOSED');
  });

  it('returns 404 for soft-deleted tasks on GET', async () => {
    const token = await login('alex@tasksync.local');

    const del = await fetch(
      `${API}/tasks/${SEED_TASK_IDS.alexInProgress}`,
      {
        method: 'DELETE',
        headers: authHeaders(token),
      },
    );
    expect(del.status).toBe(204);

    const get = await fetch(
      `${API}/tasks/${SEED_TASK_IDS.alexInProgress}`,
      { headers: authHeaders(token) },
    );
    expect(get.status).toBe(404);
  });

  it('hides outsider tasks from manager team scope', async () => {
    const token = await login('manager@tasksync.local');
    const response = await fetch(`${API}/tasks?scope=team&includeClosed=true`, {
      headers: authHeaders(token),
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      data: Array<{ id: string; owner: { id: string } }>;
    };

    expect(
      body.data.some((task) => task.id === SEED_TASK_IDS.outsiderTask),
    ).toBe(false);
    expect(
      body.data.some((task) => task.owner.id === SEED_USER_IDS.outsider),
    ).toBe(false);
    expect(
      body.data.some((task) => task.owner.id === SEED_USER_IDS.alex),
    ).toBe(true);
  });

  it('denies Admin-only user creating tasks', async () => {
    const token = await login('admin@tasksync.local');
    const response = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify({ name: 'Should fail' }),
    });

    expect(response.status).toBe(403);
  });
});
