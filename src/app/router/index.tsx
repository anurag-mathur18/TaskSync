import { createBrowserRouter, type RouteObject } from 'react-router';

import { AuthLayout } from '@/app/layouts/AuthLayout';
import { AppShell } from '@/app/layouts/AppShell';
import { NotFoundPage } from '@/app/pages/NotFoundPage';
import {
  HomeRedirect,
  RequireAdmin,
  RequireAuth,
  RequireGuest,
  RequireManager,
  RequireTaskAccess,
} from '@/app/router/guards';
import { AdminPage } from '@/features/admin/pages/AdminPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { MyTasksPage } from '@/features/tasks/pages/MyTasksPage';
import { TaskDetailPage } from '@/features/tasks/pages/TaskDetailPage';
import { TeamPage } from '@/features/team/pages/TeamPage';

export const appRoutes: RouteObject[] = [
  {
    element: <RequireGuest />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <HomeRedirect /> },
          {
            element: <RequireTaskAccess />,
            children: [
              { path: '/tasks', element: <MyTasksPage /> },
              { path: '/tasks/:id', element: <TaskDetailPage /> },
            ],
          },
          {
            element: <RequireManager />,
            children: [{ path: '/team', element: <TeamPage /> }],
          },
          {
            element: <RequireAdmin />,
            children: [{ path: '/admin', element: <AdminPage /> }],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];

/** Vite BASE_URL has a trailing slash; React Router basename must not. */
const routerBasename =
  import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

export const router = createBrowserRouter(appRoutes, {
  basename: routerBasename,
});
