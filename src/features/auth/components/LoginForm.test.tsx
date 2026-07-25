import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { setupStore } from '@/app/store';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { Roles, type LoginResponse } from '@/shared-kernel';

const navigateMock = vi.fn();
const loginMock = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual<typeof import('react-router')>(
    'react-router',
  );
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useSearchParams: () => [new URLSearchParams()],
  };
});

vi.mock('@/features/auth/api/authApi', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/auth/api/authApi')
  >('@/features/auth/api/authApi');
  return {
    ...actual,
    useLoginMutation: () =>
      [loginMock, { isLoading: false, reset: vi.fn() }] as const,
  };
});

function renderForm(search = '') {
  const store = setupStore();
  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[`/login${search}`]}>
        <LoginForm />
      </MemoryRouter>
    </Provider>,
  );
  return store;
}

const employeeLogin: LoginResponse = {
  accessToken: 'token',
  user: {
    id: '33333333-3333-4333-8333-333333333333',
    email: 'alex@tasksync.local',
    fullName: 'Alex Employee',
    roles: [Roles.EMPLOYEE],
    managerId: '22222222-2222-4222-8222-222222222222',
    orgId: '00000000-0000-4000-8000-000000000001',
  },
};

describe('LoginForm', () => {
  beforeEach(() => {
    navigateMock.mockReset();
    loginMock.mockReset();
    vi.mocked(loginMock).mockReturnValue({
      unwrap: vi.fn().mockResolvedValue(employeeLogin),
    });
  });

  it('disables SSO providers as Coming soon', () => {
    renderForm();
    expect(
      screen.getByRole('button', { name: /google sign-in \(coming soon\)/i }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /azure ad sign-in \(coming soon\)/i }),
    ).toBeDisabled();
  });

  it('shows validation errors for empty submit', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('shows generic Invalid credentials and clears password', async () => {
    const user = userEvent.setup();
    vi.mocked(loginMock).mockReturnValue({
      unwrap: vi.fn().mockRejectedValue({ status: 401 }),
    });
    renderForm();

    await user.type(
      screen.getByLabelText(/work email/i),
      'alex@tasksync.local',
    );
    await user.type(screen.getByLabelText(/^password$/i), 'wrong-password');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toHaveValue('');
    expect(screen.getByLabelText(/work email/i)).toHaveValue(
      'alex@tasksync.local',
    );
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('signs in and navigates to role home', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText(/work email/i),
      'alex@tasksync.local',
    );
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'alex@tasksync.local',
        password: 'Password123!',
      });
      expect(navigateMock).toHaveBeenCalledWith('/tasks', { replace: true });
    });
  });
});
