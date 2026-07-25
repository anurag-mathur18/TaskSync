import { render, screen } from '@testing-library/react';
import { createMemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '@/app/providers/AppProviders';
import { appRoutes } from '@/app/router';
import { store } from '@/app/store';

describe('App shell routing', () => {
  it('renders auth shell brand on /login for guests', async () => {
    const router = createMemoryRouter(appRoutes, {
      initialEntries: ['/login'],
    });

    render(<AppProviders store={store} router={router} />);

    expect(
      await screen.findByRole('heading', { name: 'TaskSync' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});
