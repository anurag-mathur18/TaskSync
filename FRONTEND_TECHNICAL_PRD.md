# TaskSync — Frontend Technical PRD

| Field | Value |
| --- | --- |
| **Product** | TaskSync — Enterprise Task Management Platform |
| **Document type** | Frontend Technical PRD (FE Engineering SSOT) |
| **Version** | 1.1 |
| **Status** | Draft for FE review — derived from Business PRD v1.1 |
| **Owner** | Frontend Lead + Program Management |
| **Last updated** | 2026-07-25 |
| **Audience** | Frontend Engineering, Design, QA, Product |
| **Upstream** | [`PRD.md`](./PRD.md) Business PRD v1.1 (**behavior wins on conflict**) |
| **Companion** | [`TECHNICAL_PRD.md`](./TECHNICAL_PRD.md) (API contracts, full-stack traceability) |
| **Design** | [`Design.md`](./Design.md) (visual tokens, layout, motion) |
| **Structure** | [`STRUCTURE.md`](./STRUCTURE.md) (feature folders) |
| **Engineering rules** | [`.cursor/rules/rules.mdc`](./.cursor/rules/rules.mdc) (**always apply**) |

---

## 1. Purpose & single source of truth

This document is the **frontend engineering single source of truth** for TaskSync MVP. It defines routes, screens, client-side RBAC presentation, data-fetching patterns, design implementation, forms, motion, accessibility, testing, and delivery phases — **without** database, Express, or server internals.

All frontend tickets, component work, and FE test plans must align to this document. When conflict arises:

| Topic | Winner |
| --- | --- |
| Business behavior, permissions, lifecycle | [`PRD.md`](./PRD.md) |
| API request/response shapes, error codes | [`TECHNICAL_PRD.md`](./TECHNICAL_PRD.md) §7 |
| Visual tokens, typography, layout patterns | [`Design.md`](./Design.md) |
| FE architecture, routes, UI rules, client patterns | **This document** |

### Related artifacts

| Artifact | Role |
| --- | --- |
| [`PRD.md`](./PRD.md) | Business requirements & acceptance (**behavior SSOT**) |
| [`TECHNICAL_PRD.md`](./TECHNICAL_PRD.md) | Full-stack engineering SSOT (API, authZ, schema) |
| **`FRONTEND_TECHNICAL_PRD.md` (this file)** | Frontend architecture, screens, client RBAC, UX contracts (**FE SSOT**) |
| [`Design.md`](./Design.md) | Visual system, views, interaction patterns |
| [`STRUCTURE.md`](./STRUCTURE.md) | Feature-based folder layout |
| [`FE_TASKS.md`](./FE_TASKS.md) | Granular implementation backlog **FS01–FS92** (mock API first) |
| [`.cursor/rules/rules.mdc`](./.cursor/rules/rules.mdc) | Mandatory FE engineering rules (RTK, Atomic Design, etc.) |

---

## 2. Frontend MVP outcome

Ship a **role-aware React SPA** that:

1. Authenticates users via local email/password (`/login`).
2. Lets **Employees** create, view, edit, and soft-delete **own** tasks; set status to `In Progress` or `Done` only — **never** `Closed`.
3. Lets **Managers** (dual Employee role) manage own tasks **plus** direct-report tasks: create on behalf, edit, soft-delete (any status), and **Close** tasks from `Done` → `Closed`.
4. Lets **Admins** manage RBAC (assign Employee/Manager roles, bind hierarchy) on `/admin` — **no** global task override UI.
5. Enforces permissions in the UI (hide/disable illegal actions) while treating the API as authoritative (403/409 handling, no UI-only security).
6. Implements design tokens from `Design.md` with WCAG AA targets on core flows.
7. Supports optional **Description** and **Due Date** on create/edit; **Name** is the only required user field.

**MVP is FE-complete** when every item in §16 (Acceptance checklist) passes on staging with seeded accounts from Technical PRD §11.2.

---

## 3. Technology stack

**Mandatory rules** (from [`.cursor/rules/rules.mdc`](./.cursor/rules/rules.mdc)): TypeScript · **Redux Toolkit** · **RTK Query** · **no Context API** · Feature-first · Atomic Design · Vitest · ESLint · Tailwind · **no inline CSS**.

| Layer | Choice | Notes |
| --- | --- | --- |
| Runtime | React 19 | Concurrent-ready; function components only |
| Build | Vite | Dev server + production bundle |
| Language | **TypeScript** (strict) | Shared Zod schemas in `shared-kernel/` |
| Styling | **Tailwind CSS 4** | CSS variables from `Design.md`; **no inline CSS**; no CSS-in-JS |
| Routing | React Router 7 | Declarative routes; route guards |
| Global / client store | **Redux Toolkit** | UI-only slices if needed (e.g. toast queue, sidebar open); **not** for server entities |
| Server state & cache | **RTK Query** | Fetch, cache, invalidate tags — **this is the FE “server-side caching” layer** |
| Forms | React Hook Form + Zod | `@hookform/resolvers/zod`; reuse `shared-kernel` schemas |
| Motion | `motion` (Framer Motion) | Four intentional animations (§11) |
| Icons | `lucide-react` | Consistent stroke icons |
| Testing | **Vitest** + React Testing Library | Unit/component; MSW for API mocks |
| Lint | **ESLint** | Enforce rules; CI must pass |

**Explicitly forbidden / out of FE MVP:** React Context API (for auth or any app state), TanStack Query / React Query, Next.js SSR, native mobile, working SSO, AI/Gemini in client.

**Why RTK Query (not Context / ad-hoc fetch):** Project rules require Redux Toolkit + RTK Query. RTK Query provides normalized **request caching**, deduping, tag-based invalidation, and optimistic updates — the FE equivalent of server-data caching until a real API cache exists on the backend.

---

## 4. Feature-based architecture + Atomic Design

Organize **product code by feature**; organize **reusable UI by Atomic Design**. Both are required by project rules.

```
src/
  main.tsx
  index.css                    # Tailwind + CSS custom properties only (no inline CSS in components)
  app/
    App.tsx
    providers/                 # Redux Provider + Router only (NO Context providers for domain)
    store/                     # configureStore, root reducer, typed hooks
    router/
    layouts/
  features/                    # Feature-first domains
    auth/
      api/                     # authApi (RTK Query injectEndpoints)
      components/              # feature-specific molecules/organisms
      pages/                   # templates / pages
      model/                   # optional UI slice if needed
      index.ts
    tasks/
    team/
    admin/
  shared/
    ui/
      atoms/                   # Button, TextField, Badge, Spinner, …
      molecules/               # FormField, StatusChip, SearchInput, …
      organisms/               # DataTable, ConfirmDialog, PageHeader, …
    api/
      baseApi.ts               # createApi + fetchBaseQuery + tagTypes
    lib/                       # cn(), formatters, permissions.ts
  shared-kernel/
    schemas/
    index.ts
```

### 4.1 Feature → product map

| Feature folder | Routes | Primary personas |
| --- | --- | --- |
| `auth` | `/login` | All (public) |
| `tasks` | `/tasks`, `/tasks/:id` | Employee, Manager (own tasks) |
| `team` | `/team` | Manager |
| `admin` | `/admin` | Admin |

### 4.2 Import & composition rules

1. **Cross-feature imports only via each feature's `index.ts`.**
2. **Atomic Design:** Atoms/molecules/organisms live under `shared/ui/*`. Feature folders compose them into feature organisms/pages — do not dump atoms at repo root.
3. **Promote to `shared/ui` only when a second feature needs the same primitive.**
4. **Shared-kernel** holds enums/DTO Zod schemas — do not duplicate types.
5. **Never use React Context API** for auth, theme, or domain state (rules). Use Redux store + RTK Query cache instead.
6. **No inline CSS** — Tailwind utility classes / CSS variables only.
7. **No root-level `components/` or `hooks/` dump.**

### 4.3 Redux store & RTK Query bootstrap

Mount order in `app/providers/AppProviders.tsx`:

```tsx
<Provider store={store}>
  <RouterProvider router={router} />
</Provider>
```

| Piece | Responsibility |
| --- | --- |
| `configureStore` | Registers `baseApi.reducer` + any UI slices; `baseApi.middleware` |
| `baseApi` (`shared/api/baseApi.ts`) | `createApi` + `fetchBaseQuery`; shared `tagTypes`; empty endpoints |
| Feature APIs | `injectEndpoints` in `features/*/api/*Api.ts` |
| Typed hooks | `useAppDispatch`, `useAppSelector` from `app/store/hooks.ts` |

**Session state:** `authApi.endpoints.getMe` / `useGetMeQuery` is the session source of truth (RTK Query cache). Route guards read from the store cache via selectors or the query hook. **No AuthContext.**

**Server-side caching (FE):** RTK Query cache with:

| Mechanism | Spec |
| --- | --- |
| `tagTypes` | `'Me'`, `'Task'`, `'TaskList'`, `'TeamTaskList'`, `'AdminUser'`, `'Report'` |
| `providesTags` / `invalidatesTags` | List + detail invalidation after create/update/delete/close |
| `keepUnusedDataFor` | Default 60s for lists; 300s for `getMe` |
| Deduping | Built-in; identical in-flight requests share one network call |
| Optimistic updates | `onQueryStarted` + `patchResult.undo()` on 403/409 |
| 401 handling | `baseQuery` wrapper: clear auth state, `authApi.util.resetApiState()`, navigate `/login` |

```ts
// shared/api/baseApi.ts (sketch)
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth, // wraps fetchBaseQuery
  tagTypes: ['Me', 'Task', 'TaskList', 'TeamTaskList', 'AdminUser', 'Report'],
  endpoints: () => ({}),
});
```

**Logout:** `POST /auth/logout` mutation → `dispatch(baseApi.util.resetApiState())` → navigate `/login`.

---

## 5. Routes, guards & app shell

### 5.1 Route table

| Path | Feature | Access | Layout |
| --- | --- | --- | --- |
| `/login` | `auth` | Public (redirect to `/tasks` if authenticated) | `AuthLayout` |
| `/` | — | Redirect → `/tasks` | — |
| `/tasks` | `tasks` | Authenticated + `EMPLOYEE` or `MANAGER` capability | `AppShell` |
| `/tasks/:id` | `tasks` | Authenticated + permitted to view task (API enforces) | `AppShell` |
| `/team` | `team` | Authenticated + `MANAGER` role | `AppShell` |
| `/admin` | `admin` | Authenticated + `ADMIN` role | `AppShell` |
| `*` | — | 404 page | Minimal |

### 5.2 Route guards

Implement in `app/router/guards.tsx` (or route `loader` / wrapper components):

| Guard | Rule | On fail |
| --- | --- | --- |
| `RequireAuth` | Valid session (`/auth/me` success) | Redirect `/login?returnUrl=...` |
| `RequireGuest` | No session | Redirect `/tasks` |
| `RequireRole(roles)` | User has at least one role | Redirect `/tasks` + toast "Access denied" |
| `RequireManager` | `MANAGER` in roles | Redirect `/tasks` |
| `RequireAdmin` | `ADMIN` in roles | Redirect `/tasks` |

**Admin-only users** (ADMIN without EMPLOYEE/MANAGER): show `/admin` nav only; redirect `/tasks` and `/team` to `/admin` or show empty-state explaining Admin is RBAC-only (no task UI).

### 5.3 App shell (`AppShell`)

Per `Design.md` — desktop sidebar `260px`, max content width `1440px`:

| Region | Content |
| --- | --- |
| **Sidebar** | Logo, nav links (role-filtered), user menu (name, email, logout) |
| **Nav items** | My Tasks (`/tasks`) — Employee+Manager; Team (`/team`) — Manager only; Admin (`/admin`) — Admin only |
| **Header** | Page title, optional breadcrumbs on detail views |
| **Main** | `<Outlet />` for feature pages |
| **Mobile** | Bottom nav bar (44px min touch targets); sidebar collapses |

**Logout:** `POST /auth/logout` + `baseApi.util.resetApiState()` + navigate `/login`.

---

## 6. Screen specifications

All screens implement RBAC **presentation** rules below. Illegal actions are **hidden or disabled** with tooltip explaining why. API responses on attempted bypass: show toast from error envelope (§8.1).

### 6.1 Login (`/login`) — `auth`

**Reference:** `Design.md` View 5 (SSO placeholders disabled for MVP).

| Element | Spec |
| --- | --- |
| Form fields | Email (required), Password (required) |
| Submit | Primary button "Sign in" → `POST /auth/login` |
| SSO buttons | Render per design but **disabled** with "Coming soon" label (Phase 2) |
| Validation | Zod: valid email format, password non-empty |
| Success | Invalidate/refetch `getMe` tags (`'Me'`), redirect `returnUrl` or `/tasks` |
| Error | Generic "Invalid credentials" (do not reveal email existence) |
| Loading | Button spinner; disable form during submit |

### 6.2 My Tasks (`/tasks`) — `tasks`

**Reference:** `Design.md` View 1 — Employee Task Dashboard.

**Audience:** Users with Employee capability (Employees and Managers for **own** tasks).

| Element | Spec |
| --- | --- |
| Header | Greeting + optional completion stat (Done / total non-Closed) |
| List | Task rows: checkbox (status shortcut), Name, Status chip, Due Date (if set), chevron → detail |
| Filters | Status tabs or pills: All, In Progress, Done (Closed hidden by default for Employee mine list) |
| FAB / CTA | "New task" opens create drawer/modal |
| Create form | **Name** (required); Description (optional); Due Date (optional); default status `In Progress` |
| Row actions | Tap row → `/tasks/:id`; swipe/delete icon if `canDeleteTask` |
| Empty | Illustration + "No tasks yet" + CTA create |
| Error | Retry banner |

**RBAC UI rules — Employee (own tasks):**

| Action | UI |
| --- | --- |
| Status `In Progress` / `Done` | Available in row quick-action and detail |
| Status `Closed` | **Not shown** in status picker |
| Delete | Enabled for own `In Progress` and `Done`; **disabled/hidden** for `Closed` |
| View Closed tasks | If any exist (edge: manager closed own), show read-only with no edit/delete |

**RBAC UI rules — Manager (own tasks on this screen):**

| Action | UI |
| --- | --- |
| Same as Employee for own tasks | — |
| Close (`Done` → `Closed`) | **Show "Close task"** primary action when status is `Done` |
| Delete own Closed | **Allowed** (manager may soft-delete own Closed) |

### 6.3 Task Detail (`/tasks/:id`) — `tasks`

**Reference:** `Design.md` View 3 (MVP subset — no markdown editor, priority, story points, or activity feed).

| Section | Fields / controls |
| --- | --- |
| Breadcrumb | My Tasks → {task name truncated} |
| Core | Name (editable if permitted), Description (optional textarea), Due Date (optional date picker) |
| Status | Segmented control or select — options filtered by `getAllowedStatusOptions(actor, task)` |
| Audit (read-only) | Date Created, Date Modified, Last Modified By (JetBrains Mono labels) |
| Metadata | Owner, Created By (show when Manager created on behalf) |
| Actions | Save (PATCH), Delete (confirm dialog), Close (Manager only, when `Done`) |

**Status control rules:**

| Actor | Task | Allowed options in UI |
| --- | --- | --- |
| Employee | Own, not Closed | `In Progress`, `Done` |
| Employee | Own, Closed | Read-only badge; no status control |
| Manager | Own or report, not Closed | `In Progress`, `Done`; plus **Close** button when `Done` |
| Manager | Own or report, Closed | Read-only; no reopen (terminal) |
| Admin (no EMP/MGR) | Any | Route/API deny — user should not reach detail |

**Delete confirmation:** "Remove this task from your list?" — explains soft delete (removed from active lists, audit retained server-side).

**Closed task:** All fields read-only except Manager may still Delete (team/own Closed).

### 6.4 Team Oversight (`/team`) — `team`

**Reference:** `Design.md` View 2 — Manager Team Oversight Grid.

**Audience:** `MANAGER` role only.

| Element | Spec |
| --- | --- |
| Header | Team metrics placeholders OK (Active count, Pending review = Done awaiting Close) |
| Grid columns | Task name, Assignee (owner), Status chip, Due Date, Actions |
| Data source | `GET /tasks?scope=team` with optional `ownerId`, `status` filters |
| Filters | Assignee dropdown (direct reports only), Status multi-select |
| Row click | Navigate `/tasks/:id` |
| Quick actions | **Close** when status `Done`; Edit; Delete |
| Create | "Create for team member" — Name required; optional Description/Due Date; **Owner** = select direct report |
| Empty | "No team tasks" when no reports or no tasks |

**RBAC UI rules:**

| Action | UI |
| --- | --- |
| View | Direct-report tasks only (API filters; empty if hierarchy unbound) |
| Edit / Delete | Enabled for report tasks |
| Close | Enabled when status is `Done` — **only** transition to `Closed` |
| Close from `In Progress` | **Not offered** (must go through `Done` first) |
| Create on behalf | Owner picker lists direct reports only |

### 6.5 Admin Console (`/admin`) — `admin`

**Reference:** `Design.md` View 4 — RBAC console.

**Audience:** `ADMIN` role only. **No task list, create, edit, or close UI.**

| Element | Spec |
| --- | --- |
| Members table | Name, Email, Roles (badges), Manager (assigned manager name or "—") |
| Role actions | Toggle/checkbox: Employee, Manager (Admin assigned separately or via seed) |
| Hierarchy | Per employee row: "Assign manager" dropdown (managers in org) / Clear |
| Validation feedback | Inline errors from API (e.g. cannot remove last admin) |
| Search | Filter members by name/email (client-side OK for pilot size) |

**RBAC UI rules:**

| Rule | UI |
| --- | --- |
| Admin does not manage tasks | No task routes linked from Admin except if user also has Manager/Employee (then sidebar shows those separately) |
| Assign Manager role | When toggled on, ensure Employee role also present (mirror server auto-add) |
| Bind hierarchy | `PUT /admin/users/:id/manager` on save |
| Non-Admin | No `/admin` nav item; guard redirects |

---

## 7. Permission helpers (client)

Location: `shared/lib/permissions.ts` (pure functions; unit-tested).

Mirror server policy from Technical PRD §6 for **UI gating only**. API remains authoritative.

```ts
type Role = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

type Actor = {
  id: string;
  roles: Role[];
  reportIds?: string[]; // from /auth/me or team metadata if provided
};

type Task = {
  id: string;
  status: 'IN_PROGRESS' | 'DONE' | 'CLOSED';
  owner: { id: string };
};

// Role checks
export function isAdmin(actor: Actor): boolean;
export function isManager(actor: Actor): boolean;
export function isEmployeeCapable(actor: Actor): boolean; // EMPLOYEE or MANAGER

// Scope
export function isOwnTask(actor: Actor, task: Task): boolean;
export function isDirectReportTask(actor: Actor, task: Task): boolean;

// Capabilities (UI)
export function canViewTask(actor: Actor, task: Task): boolean;
export function canEditTask(actor: Actor, task: Task): boolean;
export function canDeleteTask(actor: Actor, task: Task): boolean;
export function canCloseTask(actor: Actor, task: Task): boolean;
export function canCreateTaskForOwner(actor: Actor, ownerId: string): boolean;

// Status UI
export function getAllowedStatusOptions(
  actor: Actor,
  task: Task
): Array<'IN_PROGRESS' | 'DONE' | 'CLOSED'>;
export function isTerminalClosed(task: Task): boolean;
```

### 7.1 Decision table (UI)

| Helper | Return true when |
| --- | --- |
| `canViewTask` | Owner is self OR (Manager AND owner is direct report) |
| `canEditTask` | Same as view AND task not `CLOSED` |
| `canDeleteTask` | (Owner AND status ≠ `CLOSED`) OR (Manager AND (own task OR report task)) |
| `canCloseTask` | Manager AND (own OR report) AND status === `DONE` |
| `canCreateTaskForOwner` | Owner is self (Employee-capable) OR (Manager AND owner is direct report) |
| `getAllowedStatusOptions` | Employee own: `[IN_PROGRESS, DONE]`; Manager: `[IN_PROGRESS, DONE]` + separate Close action when `DONE`; Closed: `[]` |

---

## 8. API layer — RTK Query (server-data cache)

### 8.1 `baseApi` + `fetchBaseQuery`

Location: `shared/api/baseApi.ts`.

| Concern | Implementation |
| --- | --- |
| Base URL | `/api/v1` (Vite proxy in dev) |
| Auth | `prepareHeaders`: Bearer from Redux auth slice **or** cookie credentials `credentials: 'include'` per FQ1 |
| JSON | Default; parse error envelope `{ error: { code, message } }` into `FetchBaseQueryError` |
| 401 | Custom `baseQueryWithReauth`: reset API state, clear token slice, redirect `/login` |
| 403 / 409 / 404 | Surface via mutation/query error → toast mapping in UI |

Optional thin `shared/lib/apiError.ts` to normalize RTK errors to `{ status, code, message }`.

### 8.2 Cache tags (replaces query-key factory)

| Tag | Used by |
| --- | --- |
| `Me` | `getMe` |
| `Task` | `getTask` by id (`{ type: 'Task', id }`) |
| `TaskList` | `getMyTasks` (optional filter id in tag) |
| `TeamTaskList` | `getTeamTasks` |
| `AdminUser` | `getAdminUsers` |
| `Report` | `getDirectReports` |

### 8.3 Endpoints by feature (`injectEndpoints`)

#### `auth` — `features/auth/api/authApi.ts`

| Endpoint hook | Type | HTTP | Cache |
| --- | --- | --- | --- |
| `useGetMeQuery` | Query | `GET /auth/me` | `providesTags: ['Me']`; `keepUnusedDataFor: 300` |
| `useLoginMutation` | Mutation | `POST /auth/login` | On success: store token if needed; `invalidatesTags: ['Me']` |
| `useLogoutMutation` | Mutation | `POST /auth/logout` | `resetApiState()` |

#### `tasks` — `features/tasks/api/tasksApi.ts`

| Endpoint hook | Type | HTTP | Cache |
| --- | --- | --- | --- |
| `useGetMyTasksQuery` | Query | `GET /tasks?scope=mine` | `providesTags: ['TaskList']` |
| `useGetTaskQuery` | Query | `GET /tasks/:id` | `providesTags: [{ type: 'Task', id }]` |
| `useCreateTaskMutation` | Mutation | `POST /tasks` | `invalidatesTags: ['TaskList', 'TeamTaskList']` |
| `useUpdateTaskMutation` | Mutation | `PATCH /tasks/:id` | Invalidate `Task` id + lists |
| `useDeleteTaskMutation` | Mutation | `DELETE /tasks/:id` | Invalidate lists; remove detail |

**Optimistic updates:** `onQueryStarted` for status/Close; `patchResult.undo()` on error.

#### `team` — `features/team/api/teamApi.ts`

| Endpoint hook | Type | HTTP | Cache |
| --- | --- | --- | --- |
| `useGetTeamTasksQuery` | Query | `GET /tasks?scope=team` | `providesTags: ['TeamTaskList']` |
| `useGetDirectReportsQuery` | Query | `GET /admin/managers/:id/reports` | `providesTags: ['Report']` |

#### `admin` — `features/admin/api/adminApi.ts`

| Endpoint hook | Type | HTTP | Cache |
| --- | --- | --- | --- |
| `useGetAdminUsersQuery` | Query | `GET /admin/users` | `providesTags: ['AdminUser']` |
| `useUpdateUserRolesMutation` | Mutation | `PATCH /admin/users/:id/roles` | `invalidatesTags: ['AdminUser', 'Me']` |
| `useSetUserManagerMutation` | Mutation | `PUT /admin/users/:id/manager` | `invalidatesTags: ['AdminUser', 'Report', 'TeamTaskList']` |

### 8.4 UI-only Redux slices (optional)

Use RTK slices **only** for non-server UI state (e.g. `uiSlice`: sidebarCollapsed). Do **not** mirror Task entities in a hand-written slice — RTK Query cache is the source of truth for server data.

---

## 9. Design tokens & components

Implement tokens as **CSS custom properties** in `index.css` + Tailwind `@theme` extension. Source: `Design.md`.

### 9.1 Core colors

| Token | Hex | Tailwind / CSS var | Usage |
| --- | --- | --- | --- |
| `primary` | `#003d9b` | `--color-primary` | Primary buttons, active nav, links |
| `on-primary` | `#ffffff` | `--color-on-primary` | Text on primary |
| `primary-container` | `#0052cc` | — | Hero accents, progress |
| `background` | `#faf9ff` | `--color-background` | App canvas |
| `surface-container-lowest` | `#ffffff` | — | Cards, rows |
| `surface-container-low` | `#f1f3ff` | — | Inputs, secondary headers |
| `outline-variant` | `#c3c6d6` | — | Hairline borders |
| `error` | `#ba1a1a` | — | Destructive actions |

### 9.2 Typography

Load via `@fontsource` or Google Fonts:

| Role | Font | Tailwind class |
| --- | --- | --- |
| Display / headlines | IBM Plex Sans | `font-display` |
| Body | Inter | `font-body` |
| Labels / audit / status | JetBrains Mono | `font-mono` |

Scale: `display` 36/44, `headline-lg` 28/36, `headline-md` 20/28, `body-lg` 16/24, `body-md` 14/20, `body-sm` 12/16, `label-md` 12/16, `label-sm` 10/12.

### 9.3 Status chips (`TaskStatusBadge`)

| Status | Label | Background | Text / border |
| --- | --- | --- | --- |
| `IN_PROGRESS` | In Progress | `#afecff` (tertiary-fixed) | `#004b59` / `#003d9b` |
| `DONE` | Done | `#e8f5e9` | `#1b5e20` |
| `CLOSED` | Closed | `#f1f3ff` | `#737685` |
| Overdue (Due Date past, not Closed) | optional badge | `#ffdad6` | `#ba1a1a` |

Chip shape: `rounded-full`, `font-mono`, `text-label-sm`, padding `xs`–`sm`.

### 9.4 Layout tokens

| Token | Value |
| --- | --- |
| Base spacing unit | 4px |
| Scale | xs 4, sm 8, md 16, lg 24, xl 32 |
| Sidebar width | 260px |
| Max content width | 1440px |
| Desktop margin | 32px; gutter 16px |
| Mobile margin | 16px |
| Border radius | sm 2px, md 4–6px, lg/xl 8–12px, full pills |

### 9.5 Shared UI — Atomic Design

| Level | Location | Examples |
| --- | --- | --- |
| **Atoms** | `shared/ui/atoms/` | `Button`, `TextInput`, `TextArea`, `Spinner`, `Badge` |
| **Molecules** | `shared/ui/molecules/` | `FormField`, `StatusChip`, `SearchInput`, `EmptyState` |
| **Organisms** | `shared/ui/organisms/` | `DataTable`, `ConfirmDialog`, `PageHeader`, `AppSidebar` (if shared) |

Feature-specific compositions stay in `features/*/components/` (still built from atoms/molecules). Toast via `sonner` or organism wrapper — no Context.

---

## 10. Forms

| Form | Schema (Zod) | Fields |
| --- | --- | --- |
| Login | `loginSchema` | email, password |
| Create task | `createTaskSchema` | name (min 1, max 200), description (optional, max 10k), dueDate (optional ISO date) |
| Edit task | `updateTaskSchema` | partial of above + status (filtered client-side before submit) |
| Create for report | `createTaskSchema` + ownerId | ownerId required (UUID) |
| Admin roles | `updateRolesSchema` | roles array |
| Assign manager | `setManagerSchema` | managerId uuid \| null |

**Patterns:**

- RHF `mode: 'onBlur'` for text; submit validation on create.
- Due Date: native `<input type="date">` or headless date picker; store/send `YYYY-MM-DD`.
- Description: optional; empty string → `null` on submit.
- Disable submit while mutation pending; show field errors inline.

---

## 11. Motion (four intentional animations)

Use `motion` sparingly — **exactly four** motion patterns in MVP:

| # | Pattern | Where | Spec |
| --- | --- | --- | --- |
| M1 | Button press | All primary/secondary buttons | `whileTap={{ scale: 0.95 }}`, 150ms |
| M2 | Checkbox complete | Task row checkbox (My Tasks) | Scale + border/background transition to green `#1b5e20`, 200ms |
| M3 | Table/list row hover | Team grid, task list | Background `primary/5`, 150ms ease |
| M4 | Route content fade | Page transitions inside shell | `opacity` 0→1, 150ms on `<Outlet />` key=pathname |

**Do not add** drawer slide, FAB bounce, or parallax in MVP unless design blocks acceptance.

Flyout create drawer (if used): CSS transition only (`translate-y`, 300ms) — counts as layout, not a fifth `motion` component.

---

## 12. Accessibility, loading, empty & error states

### 12.1 Accessibility (WCAG AA)

| Requirement | Implementation |
| --- | --- |
| Focus visible | `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` |
| Color contrast | 4.5:1 body, 3:1 large text per `Design.md` |
| Touch targets | Min 44×44px on mobile for buttons, nav, checkboxes |
| Labels | All inputs have `<label>` or `aria-label` |
| Status | Status chips include text, not color-only |
| Dialogs | Focus trap, `aria-modal`, Esc to close |
| Live regions | Toast announcements `role="status"` |

### 12.2 Loading

| Context | Pattern |
| --- | --- |
| Initial page load | Skeleton rows (3–5) matching list/grid layout |
| Task detail | Skeleton form fields |
| Mutation | Inline button spinner; disable duplicate submits |
| Background refetch | Subtle opacity or no indicator (avoid layout shift) |

### 12.3 Empty

| Screen | Message + action |
| --- | --- |
| My Tasks | "No tasks yet" + Create CTA |
| Team | "No team tasks" / "Assign reports in Admin" if no reports |
| Admin | Unlikely empty; "No members" if API returns [] |
| Search/filter | "No matching tasks" + clear filters |

### 12.4 Error

| Type | UX |
| --- | --- |
| Query error | Banner with Retry button (`refetch()`) |
| 403 | Toast; stay on page |
| 404 task | "Task not found" + link to My Tasks |
| Network | "Connection problem" + Retry |
| Form validation | Inline field messages |

---

## 13. Frontend security

| # | Requirement |
| --- | --- |
| FS-1 | Never rely on UI-only hiding for security; handle 403/409 from API |
| FS-2 | Do not store passwords; clear password field on error |
| FS-3 | Prefer httpOnly cookies for refresh; if access token in memory, clear on logout |
| FS-4 | Sanitize user content display (React default escaping); no `dangerouslySetInnerHTML` for Description in MVP |
| FS-5 | Do not log tokens or PII to console in production |
| FS-6 | `returnUrl` query param: allow only relative paths (prevent open redirect) |
| FS-7 | Admin routes double-guarded: nav hidden + route guard |
| FS-8 | No secrets in frontend bundle |

---

## 14. Testing strategy

### 14.1 Unit / component (Vitest + RTL)

| Area | Tests |
| --- | --- |
| `permissions.ts` | Full matrix: Employee/Manager/Admin × own/report/Closed |
| `getAllowedStatusOptions` | No Closed for Employee; Close action gating |
| `TaskStatusBadge` | Renders correct label/colors per status |
| Form schemas | Zod rejects empty name; accepts optional description/dueDate |

### 14.2 Integration (RTL + MSW)

| Scenario | Assert |
| --- | --- |
| Employee task list | Create shows in list; Closed option absent |
| Manager Close | Close button visible on Done; calls PATCH |
| Admin guard | Non-admin redirected from `/admin` |
| 403 handling | Toast shown; optimistic rollback |

### 14.3 E2E smoke (Playwright — recommended)

1. Login as Employee → create task → mark Done → verify no Close.
2. Login as Manager → team grid → Close report's Done task.
3. Login as Admin → assign roles + bind hierarchy.
4. Employee cannot navigate to `/admin` or `/team`.

---

## 15. Delivery phases

### FE-0 — Scaffold & design foundation

- [ ] Vite + React 19 + TypeScript + Tailwind 4 (no inline CSS) + ESLint
- [ ] Redux Toolkit store + `baseApi` (RTK Query) + Provider (no Context)
- [ ] Atomic Design folders under `shared/ui/{atoms,molecules,organisms}`
- [ ] Feature-first folders per `STRUCTURE.md`
- [ ] `shared-kernel` Zod schemas; font loading

### FE-1 — Auth & My Tasks

- [ ] Login page + guards
- [ ] `useGetMeQuery` / login / logout mutations
- [ ] My Tasks list + create drawer
- [ ] Task Detail read view
- [ ] `StatusChip`, empty/loading/error states
- [ ] Permission helpers + Vitest unit tests

### FE-2 — Task mutations & Manager team

- [ ] Edit/delete on Task Detail
- [ ] Status transitions (Employee: In Progress/Done)
- [ ] Manager Close on own + team (`/team` grid)
- [ ] Create on behalf of report
- [ ] RTK Query optimistic updates + tag invalidation
- [ ] MSW integration tests for RBAC UI

### FE-3 — Admin & hardening

- [ ] Admin console: users, roles, hierarchy
- [ ] Role-filtered sidebar nav
- [ ] Four motion patterns (§11)
- [ ] A11y pass on core flows
- [ ] Vitest suites green; FE acceptance checklist §16 complete

---

## 16. Frontend acceptance checklist (MVP)

- [ ] `/login` works with local email/password; SSO disabled/placeholder
- [ ] Authenticated users land on `/tasks`; guards enforce roles
- [ ] Employee can CRUD own tasks with Name required; Description/Due Date optional
- [ ] Employee status control shows **In Progress** and **Done** only — **not Closed**
- [ ] Employee can soft-delete own In Progress and Done; **not** Closed
- [ ] Manager sees `/team` with direct-report tasks only
- [ ] Manager can create task on behalf of report (owner picker)
- [ ] Manager can Close **Done** tasks (own + reports); Close not shown for In Progress
- [ ] Closed tasks are read-only (no reopen UI)
- [ ] Admin `/admin` manages roles and hierarchy; **no task management UI** for Admin-only
- [ ] Unauthorized routes/actions blocked in UI **and** via API error handling
- [ ] Audit fields displayed on Task Detail (Created, Modified, Last Modified By)
- [ ] Design tokens: primary `#003d9b`, fonts, status chips match §9
- [ ] WCAG AA focus rings and 44px touch targets on mobile
- [ ] Loading, empty, and error states on all list/detail screens

---

## 17. Non-goals (frontend MVP)

- SSO login flows (Google / Azure AD) — UI placeholder only
- Comments, attachments, @mentions, activity feed
- Rich markdown description editor
- Priority, story points, analytics dashboards (beyond static placeholders)
- Offline mode / PWA install
- Real-time websockets / live cursors
- Admin global task override UI
- Multi-level hierarchy visualization
- Reopen Closed tasks
- Hard-delete UX or undelete UI
- Internationalization (English only)
- `@google/genai` or any AI features in the client

---

## 18. Open frontend questions

| ID | Question | Recommendation | Status |
| --- | --- | --- | --- |
| FQ1 | Access token storage: memory + Bearer header vs httpOnly cookie only? | Align with API: **httpOnly cookies** preferred; Bearer in Redux auth slice for local mock | Open |
| FQ2 | Create task UX: modal vs bottom drawer vs dedicated `/tasks/new` route? | **Drawer** on mobile, modal on desktop (single component, responsive) | Open |
| FQ3 | Team grid: inline Close vs bulk select + Close? | **Inline row action** for MVP; bulk deferred | Open |
| FQ4 | Toast library: custom vs `sonner`? | **`sonner`** (no Context toast provider pattern that fights rules — mount in `App.tsx`) | Open |

Product-affecting UI changes require Business PRD review; FE-only choices resolve within FE review.

---

## 19. Traceability (Business → Frontend)

| Business ID | Frontend delivery |
| --- | --- |
| FR-T1–T10 | Tasks feature: create/list/detail forms + API hooks |
| FR-E1–E4 | Permission helpers; filtered status UI on My Tasks / Detail |
| FR-M1–M6 | Team feature; Close button; create-on-behalf owner picker |
| FR-A1–A5 | Admin feature; role/hierarchy UI; route guard |
| §9.3 Status lifecycle | `getAllowedStatusOptions`; Close only from Done |
| §9.4 Soft delete | Delete confirm copy; remove from lists on success |
| §12 UX alignment | Screens §6 map to Design.md Views 1–4, 5 |

---

## 20. Document change control

| Version | Date | Author | Summary |
| --- | --- | --- | --- |
| 1.1 | 2026-07-25 | Frontend / PM | Align to `.cursor/rules`: Redux Toolkit + RTK Query cache, no Context, Atomic Design |

**Change process:** FE RFC → update this file → bump version → sync tickets. Behavior changes require Business PRD bump first; API shape changes require Technical PRD sync.

---

*End of Frontend Technical PRD — TaskSync v1.0*
