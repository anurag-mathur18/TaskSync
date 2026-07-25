# TaskSync — Technical Product Requirements Document (Technical PRD)

| Field | Value |
| --- | --- |
| **Product** | TaskSync — Enterprise Task Management Platform |
| **Document type** | Technical PRD (Engineering Single Source of Truth) |
| **Version** | 1.0 |
| **Status** | Draft for eng review — derived from Business PRD v1.1 |
| **Owner** | Engineering Lead + Program Management |
| **Last updated** | 2026-07-25 |
| **Audience** | Engineering, QA, Security, DevOps, Product |
| **Upstream** | [`PRD.md`](./PRD.md) Business PRD v1.1 (**behavior wins on conflict**) |
| **Design** | [`Design.md`](./Design.md) |
| **Implementation repo** | `TaskSync` (this repository) |

---

## 1. Purpose

This Technical PRD translates Business PRD v1.1 into **buildable engineering contracts**: architecture, data model, APIs, authZ rules, NFRs, and test obligations.

| Conflict rule | Winner |
| --- | --- |
| Product behavior / permissions / lifecycle | Business PRD |
| How to implement (stack, schema, API shape) | This Technical PRD |
| Frontend routes, screens, client RBAC, FE patterns | [`FRONTEND_TECHNICAL_PRD.md`](./FRONTEND_TECHNICAL_PRD.md) |
| Visual tokens / layout | `Design.md` |

---

## 2. Engineering summary

Build a **single-tenant-capable** (pilot: one org) web app with:

- **SPA frontend** (React + TypeScript + Vite + Tailwind) consuming a JSON API
- **REST API** (Node.js + Express + TypeScript) enforcing all RBAC server-side
- **PostgreSQL** as system of record with soft-delete and audit columns
- **Local email/password auth** (JWT access + refresh, httpOnly cookies preferred)
- Roles: `EMPLOYEE`, `MANAGER`, `ADMIN` with single-level manager→report hierarchy

**MVP must prove:** task CRUD, status machine, soft delete, manager close, admin RBAC — with **zero UI-only authorization**.

---

## 3. Proposed architecture

```
┌──────────────┐     HTTPS/JSON      ┌─────────────────┐      SQL       ┌────────────┐
│  React SPA   │ ◄─────────────────► │  Express API    │ ◄────────────► │ PostgreSQL │
│  Vite + TW   │   Bearer / Cookie   │  AuthZ + Domain │                │            │
└──────────────┘                     └────────┬────────┘                └────────────┘
                                              │
                                       ┌──────▼──────┐
                                       │  Auth / JWT │
                                       │  bcrypt pwd │
                                       └─────────────┘
```

### 3.1 Logical modules

| Module | Responsibility |
| --- | --- |
| `auth` | Register (seed/admin-provisioned), login, logout, session refresh, password hashing |
| `users` | User profile read; admin list users |
| `rbac` | Role assignment; hierarchy binding |
| `tasks` | Task CRUD, status transitions, soft delete, list filters |
| `policy` | Central authorization decisions (pure functions + DB lookups) |
| `audit` | Created/modified stamps (inline on entities; no separate event store in MVP) |

### 3.2 Deployment topology (pilot)

| Component | Pilot target |
| --- | --- |
| Frontend | Static assets (Vite build) behind CDN or same origin |
| API | Single Node process (or container) |
| DB | Managed PostgreSQL (or local Docker for dev) |
| Secrets | Env vars (`.env`); never commit |

Same-origin reverse proxy (`/api` → API) recommended to simplify cookies/CORS.

---

## 4. Technology decisions (MVP)

| Layer | Choice | Rationale |
| --- | --- | --- |
| UI | React 19 + TypeScript + Vite + Tailwind 4 | Feature-sliced `src/`; `Design.md` tokens |
| Motion | `motion` (already in deps) | Micro-interactions per design |
| Icons | `lucide-react` | Already present |
| API | Express + TypeScript | Already in package.json; simple for MVP |
| Validation | Zod (shared schemas) | Request/response contracts + FE form reuse |
| ORM | Prisma **or** Drizzle | Prefer **Prisma** for speed-to-schema; either acceptable |
| DB | PostgreSQL 16+ | Relational RBAC + soft delete + indexes |
| Auth | Email/password + JWT (access 15m) + refresh (7d, rotated) | Business: local/email first |
| Password | bcrypt (cost ≥ 12) or argon2id | Industry default |
| IDs | UUID v4 / ULID | Opaque public IDs |
| Time | All timestamps **UTC** ISO-8601 | Audit consistency |
| API style | REST + JSON | Simple QA & tooling |
| Package mgmt | npm | Existing project |

**Explicitly deferred:** Next.js App Router, GraphQL, Redis, message queues, SSO (OIDC), multi-tenant row isolation beyond `organization_id` stub.

### 4.1 Optional `organization_id`

Add nullable/`NOT NULL` `organization_id` on users/tasks **now** (default single org seed) to avoid a painful Phase 2 migration. MVP enforces one org via seed; no cross-org APIs.

---

## 5. Data model

### 5.1 ERD (logical)

```
Organization 1──* User
User (MANAGER) 1──* ReportingEdge *──1 User (EMPLOYEE report)
User 1──* Task (as owner)
User 1──* Task (as created_by)
User 1──* Task (as last_modified_by)
User *──* RoleAssignment ──* Role   (or roles as enum array on User)
```

### 5.2 Enums

```ts
enum Role {
  EMPLOYEE = 'EMPLOYEE',
  MANAGER  = 'MANAGER',
  ADMIN    = 'ADMIN',
}

enum TaskStatus {
  IN_PROGRESS = 'IN_PROGRESS', // UI label: "In Progress"
  DONE        = 'DONE',        // UI label: "Done"
  CLOSED      = 'CLOSED',      // UI label: "Closed"
}
```

**Role storage decision (locked for MVP):** `User.roles` as PostgreSQL `text[]` or join table `user_roles(user_id, role)`. Prefer **`user_roles`** for query clarity and uniqueness.

**Manager dual-role:** When Admin assigns `MANAGER`, system **also ensures** `EMPLOYEE` is present (or policy treats `MANAGER ⊇ EMPLOYEE`). Recommended: store both rows; policy: `hasRole(MANAGER)` implies employee capabilities.

### 5.3 Tables

#### `organizations`

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | UUID | PK |
| `name` | TEXT | NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL DEFAULT now() |

#### `users`

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | UUID | PK |
| `organization_id` | UUID | FK → organizations NOT NULL |
| `email` | CITEXT / TEXT | UNIQUE per org (or globally UNIQUE for pilot) |
| `password_hash` | TEXT | NOT NULL |
| `full_name` | TEXT | NOT NULL |
| `is_active` | BOOLEAN | NOT NULL DEFAULT true |
| `created_at` | TIMESTAMPTZ | NOT NULL |
| `updated_at` | TIMESTAMPTZ | NOT NULL |

#### `user_roles`

| Column | Type | Constraints |
| --- | --- | --- |
| `user_id` | UUID | FK → users ON DELETE CASCADE |
| `role` | TEXT | CHECK IN ('EMPLOYEE','MANAGER','ADMIN') |
| PK | (`user_id`, `role`) | |

#### `reporting_edges` (single-level hierarchy)

| Column | Type | Constraints |
| --- | --- | --- |
| `manager_id` | UUID | FK → users |
| `employee_id` | UUID | FK → users |
| `organization_id` | UUID | FK → organizations |
| PK | (`manager_id`, `employee_id`) | |
| UNIQUE | (`employee_id`) | **One manager per employee (MVP)** |
| CHECK | `manager_id <> employee_id` | |

Indexes: `(manager_id)`, `(employee_id)`.

#### `tasks`

| Column | Type | Constraints |
| --- | --- | --- |
| `id` | UUID | PK |
| `organization_id` | UUID | FK NOT NULL |
| `name` | TEXT | NOT NULL, CHECK length(trim(name)) > 0 |
| `description` | TEXT | NULLABLE |
| `due_date` | DATE | NULLABLE (date-only MVP; store DATE) |
| `status` | TEXT | NOT NULL CHECK IN (...), DEFAULT `'IN_PROGRESS'` |
| `owner_id` | UUID | FK → users NOT NULL |
| `created_by_id` | UUID | FK → users NOT NULL |
| `last_modified_by_id` | UUID | FK → users NOT NULL |
| `created_at` | TIMESTAMPTZ | NOT NULL |
| `updated_at` | TIMESTAMPTZ | NOT NULL |
| `deleted_at` | TIMESTAMPTZ | NULL = active; NOT NULL = soft-deleted |
| `deleted_by_id` | UUID | FK NULL |

Indexes:

- `(organization_id, owner_id) WHERE deleted_at IS NULL`
- `(organization_id, status) WHERE deleted_at IS NULL`
- `(organization_id, updated_at DESC) WHERE deleted_at IS NULL`

**API field mapping**

| Business field | Column / JSON |
| --- | --- |
| Name | `name` |
| Description | `description` |
| Date Created | `created_at` |
| Date Modified | `updated_at` |
| Last Modified By | `last_modified_by_id` (+ joined `full_name`/`email`) |
| Due Date | `due_date` |
| Status | `status` (map labels in API serializer) |

### 5.4 Soft delete rules (implementation)

- `DELETE /tasks/:id` → set `deleted_at = now()`, `deleted_by_id = actor`, bump `updated_at` + `last_modified_by_id`.
- Default list/get queries: `WHERE deleted_at IS NULL`.
- No undelete API in MVP (Phase 2 recovery tooling).
- Soft-deleted tasks are **not** visible to Employee/Manager list/detail (404 on get by id if deleted or unauthorized — same response to avoid leakage).

---

## 6. Authorization model (server)

### 6.1 Policy helpers

```ts
type Actor = { id: string; orgId: string; roles: Role[] };

function isAdmin(a: Actor): boolean
function isManager(a: Actor): boolean
function isEmployeeCapable(a: Actor): boolean  // EMPLOYEE or MANAGER

async function isDirectReport(managerId: string, employeeId: string): Promise<boolean>
async function canViewTask(actor: Actor, task: Task): Promise<boolean>
async function canMutateTask(actor: Actor, task: Task): Promise<boolean>
async function canCloseTask(actor: Actor, task: Task): Promise<boolean>
async function canDeleteTask(actor: Actor, task: Task): Promise<boolean>
async function canAssignOwner(actor: Actor, ownerId: string): Promise<boolean>
```

### 6.2 Decision table (enforce on every request)

| Action | Allow when |
| --- | --- |
| List/view task | `task.owner_id === actor.id` OR (`isManager` AND `isDirectReport(actor, owner)`) |
| Create task (owner = self) | `isEmployeeCapable` |
| Create task (owner = report) | `isManager` AND `isDirectReport(actor, ownerId)` |
| Edit name/description/due_date | `canMutateTask` (owner or manager-of-owner) |
| Status → `IN_PROGRESS` / `DONE` | `canMutateTask` AND transition legal AND status ≠ target if same |
| Status → `CLOSED` | `canCloseTask`: `isManager` AND (owner is self OR direct report) AND from `DONE` only |
| Status from `CLOSED` | **Always deny** |
| Soft delete | Owner and status ≠ `CLOSED`, OR manager-of-owner (any status), OR manager deleting own including Closed |
| Admin role/hierarchy APIs | `isAdmin` only |
| Task APIs as Admin-only user | **Deny** unless also EMPLOYEE/MANAGER (Business PRD) |

### 6.3 Status transition matrix (code must match)

| From \ To | IN_PROGRESS | DONE | CLOSED |
| --- | --- | --- | --- |
| *(create)* | ✅ default | ❌ | ❌ |
| IN_PROGRESS | — | ✅ owner/mgr | ❌ |
| DONE | ✅ owner/mgr | — | ✅ **manager only** |
| CLOSED | ❌ | ❌ | — |

Invalid transition → `409 CONFLICT` with code `INVALID_STATUS_TRANSITION`.  
Unauthorized but otherwise valid → `403 FORBIDDEN` with code `RBAC_DENIED`.

### 6.4 Defense in depth

1. Route middleware: authenticate
2. Handler: load resource + policy check
3. Service layer: re-validate status machine
4. DB constraints: enums, non-empty name, one manager per employee
5. UI: hide illegal actions (UX only; never sole control)

---

## 7. API contract

Base path: `/api/v1`  
Content-Type: `application/json`  
Auth: `Authorization: Bearer <access_token>` **or** httpOnly cookie `access_token`

### 7.1 Standard error envelope

```json
{
  "error": {
    "code": "RBAC_DENIED",
    "message": "You cannot close this task.",
    "details": {}
  }
}
```

| HTTP | When |
| --- | --- |
| 400 | Validation (Zod) |
| 401 | Missing/invalid token |
| 403 | Authenticated but RBAC deny |
| 404 | Not found **or** not visible (no existence leak) |
| 409 | Illegal status transition / unique conflict |
| 422 | Semantic validation (optional; else 400) |
| 500 | Unexpected |

### 7.2 Auth

| Method | Path | Body | Success |
| --- | --- | --- | --- |
| POST | `/auth/login` | `{ email, password }` | `{ user, accessToken }` (+ Set-Cookie refresh) |
| POST | `/auth/refresh` | refresh cookie/body | new access token |
| POST | `/auth/logout` | — | 204 |
| GET | `/auth/me` | — | current user + roles |

**MVP user provisioning:** Admin-created users (or seed script). Public self-registration **off** by default (`ALLOW_PUBLIC_REGISTER=false`).

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| POST | `/admin/users` | Admin | Create user with roles + optional managerId |

### 7.3 Tasks

#### `GET /tasks`

Query:

| Param | Type | Notes |
| --- | --- | --- |
| `scope` | `mine` \| `team` | `mine` default; `team` requires Manager |
| `status` | enum | optional filter |
| `ownerId` | UUID | Manager only; must be report |
| `includeClosed` | bool | default true for manager team; product choice: default **false** for employee mine |
| `page` | int | default 1 |
| `pageSize` | int | default 20, max 100 |

Response:

```json
{
  "data": [ Task ],
  "meta": { "page": 1, "pageSize": 20, "total": 42 }
}
```

#### `POST /tasks`

```json
{
  "name": "string",           // required
  "description": "string|null",
  "dueDate": "YYYY-MM-DD|null",
  "ownerId": "uuid|null"      // null/omit = self; manager may set report
}
```

Server sets: `status=IN_PROGRESS`, audit fields, `created_by_id=actor`.

#### `GET /tasks/:id` → `Task`

#### `PATCH /tasks/:id`

```json
{
  "name": "string?",
  "description": "string|null?",
  "dueDate": "YYYY-MM-DD|null?",
  "status": "IN_PROGRESS|DONE|CLOSED?"
}
```

Partial update; each field re-authorized. Status changes run transition + RBAC checks.

#### `DELETE /tasks/:id` → `204` (soft delete)

### 7.4 Admin RBAC

| Method | Path | Body |
| --- | --- | --- |
| GET | `/admin/users` | — list org users + roles + manager |
| PATCH | `/admin/users/:id/roles` | `{ roles: Role[] }` — must keep valid set; assigning MANAGER auto-adds EMPLOYEE |
| PUT | `/admin/users/:id/manager` | `{ managerId: uuid \| null }` — bind/unbind report edge |
| GET | `/admin/managers/:id/reports` | list direct reports |

**Validation**

- Cannot remove last Admin (optional safety; recommend enforce ≥1 admin).
- `managerId` must have `MANAGER` role.
- Employee may have at most one manager.
- Clearing manager removes reporting edge.

### 7.5 Task DTO

```ts
type TaskDto = {
  id: string;
  name: string;
  description: string | null;
  dueDate: string | null;          // YYYY-MM-DD
  status: 'IN_PROGRESS' | 'DONE' | 'CLOSED';
  statusLabel: 'In Progress' | 'Done' | 'Closed';
  owner: UserSummary;
  createdBy: UserSummary;
  lastModifiedBy: UserSummary;
  createdAt: string;               // ISO-8601
  updatedAt: string;
};

type UserSummary = {
  id: string;
  fullName: string;
  email: string;
};
```

---

## 8. Frontend technical requirements

**Must follow** [`.cursor/rules/rules.mdc`](./.cursor/rules/rules.mdc) and [`FRONTEND_TECHNICAL_PRD.md`](./FRONTEND_TECHNICAL_PRD.md):

- **Redux Toolkit** + **RTK Query** (FE server-data caching via cache tags)
- **No React Context API**
- Feature-first folders + Atomic Design under `shared/ui`
- TypeScript, Vitest, ESLint, Tailwind, no inline CSS

### 8.1 Routes

| Path | Persona | Notes |
| --- | --- | --- |
| `/login` | Public | Local email/password |
| `/app` or `/tasks` | Employee(+Manager) | Employee dashboard (`Design.md` View 1) |
| `/team` | Manager | Team oversight grid (View 2) |
| `/tasks/:id` | Permitted | Detail + audit fields (View 3) |
| `/admin` | Admin | RBAC console (View 4) |

Route guards: role-based redirects; API still authoritative.

### 8.2 State & data fetching

- **RTK Query** for all server data (auth me, tasks, team, admin).
- Optimistic updates via `onQueryStarted` + undo on 403/409.
- Tag invalidation after mutations (`Me`, `Task`, `TaskList`, etc.).

### 8.3 Permission-aware UI

| Actor | UI rules |
| --- | --- |
| Employee | Status select: In Progress, Done only; no Close; no `/team`, no `/admin` |
| Manager | Own + team; Close enabled when status is Done; create with assignee = report |
| Admin | `/admin` only for RBAC; if also Manager/Employee, show those apps too |

### 8.4 Design system

Implement CSS variables / Tailwind theme from `Design.md`. WCAG AA focus rings and 44px touch targets on mobile.

### 8.5 Gemini / AI

Out of MVP scope.

---

## 9. Non-functional requirements (engineering)

| ID | Category | Target |
| --- | --- | --- |
| TNFR-1 | AuthZ correctness | 100% of policy matrix tests pass in CI |
| TNFR-2 | Latency | p95 `GET /tasks` < 300ms at pilot load (≤500 users, ≤50k tasks) on staging hardware |
| TNFR-3 | Availability | Pilot best-effort; target 99% monthly once hosted |
| TNFR-4 | Password storage | No plaintext; bcrypt/argon2 only |
| TNFR-5 | Transport | HTTPS in deployed env; secure cookies `Secure; HttpOnly; SameSite=Lax` |
| TNFR-6 | Audit integrity | `created_at` immutable; `updated_at`/`last_modified_by_id` set on every mutating service method |
| TNFR-7 | Idempotency | Soft delete twice → second call 404 or 204 (pick one; recommend **204** if already deleted by same actor visibility rules — simpler: **404**) |
| TNFR-8 | Logging | Structured JSON logs: `requestId`, `actorId`, `route`, `statusCode`; **no passwords** |
| TNFR-9 | Backups | Daily DB backup in hosted pilot |
| TNFR-10 | A11y | WCAG AA for core flows |

---

## 10. Security requirements

1. Server-side RBAC on every mutation/read.
2. Parameterized queries / ORM only (no string-concat SQL).
3. Rate-limit `/auth/login` (e.g. 10/min/IP).
4. CORS allowlist for known FE origins.
5. Helmet (or equivalent) security headers.
6. Input length limits: `name` ≤ 200, `description` ≤ 10_000.
7. Do not leak whether email exists on login (generic “Invalid credentials”).
8. Admin routes separate middleware `requireAdmin`.
9. Secrets via env: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.

---

## 11. Seed & local development

### 11.1 Docker Compose (recommended)

Services: `db` (Postgres 16), `api`, `web` (optional).

### 11.2 Seed users (deterministic passwords for local only)

| Email | Roles | Notes |
| --- | --- | --- |
| `admin@tasksync.local` | ADMIN | RBAC only |
| `manager@tasksync.local` | MANAGER, EMPLOYEE | Has reports |
| `alex@tasksync.local` | EMPLOYEE | Report of manager |
| `sam@tasksync.local` | EMPLOYEE | Report of manager |
| `outsider@tasksync.local` | EMPLOYEE | **Not** under manager (negative tests) |

Seed sample tasks across statuses for QA.

### 11.3 Env template

```bash
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
ALLOW_PUBLIC_REGISTER=false
NODE_ENV=development
PORT=4000
WEB_ORIGIN=http://localhost:3000
```

---

## 12. Repository structure (feature-based)

Applications are organized **by feature**, not by component type. See [`STRUCTURE.md`](./STRUCTURE.md).

```
TaskSync/
  src/
    main.tsx
    app/                         # Shell: App, providers, router, layouts
    features/                    # Frontend by domain
      auth/                      # api, components, hooks, pages, types
      tasks/
      team/
      admin/
    shared/                      # FE cross-feature only (ui, lib, hooks)
    shared-kernel/               # Zod/enums/DTOs shared FE + API
    server/
      app/                       # Express bootstrap + mount
      shared/                    # db, config, errors, auth middleware
      features/
        auth/
        tasks/
        admin/
        policy/                  # Central authZ
  STRUCTURE.md
  PRD.md
  TECHNICAL_PRD.md
  Design.md
```

**Rules:** import other features only via each feature’s `index.ts`; promote UI to `shared/ui` only when used by 2+ features; server features own routes/service/repository and call `policy` for authorization.

---

## 13. Testing strategy

### 13.1 Mandatory CI gates

| Layer | What |
| --- | --- |
| Unit | Status transition function; policy helpers with mocked edges |
| Integration | API + test DB: RBAC matrix, soft delete, audit stamps |
| E2E (smoke) | Login → create → Done → manager Close; employee cannot Close |

### 13.2 RBAC test matrix (minimum)

| # | Scenario | Expected |
| --- | --- | --- |
| T1 | Employee creates own task | 201, status IN_PROGRESS |
| T2 | Employee sets CLOSED | 403 |
| T3 | Employee deletes own DONE | 204 soft |
| T4 | Employee deletes own CLOSED | 403 |
| T5 | Employee views outsider task | 404 |
| T6 | Manager closes report DONE | 200 CLOSED |
| T7 | Manager closes non-report | 403/404 |
| T8 | Manager creates on behalf of report | 201 owner=report, createdBy=manager |
| T9 | Manager creates for outsider | 403 |
| T10 | Closed → Done | 409 |
| T11 | Admin without EMP/MGR hits POST /tasks | 403 |
| T12 | Admin assigns MANAGER + bind report | edges work for T6 |
| T13 | Soft-deleted task GET | 404 |
| T14 | Audit: PATCH updates lastModifiedBy | matches actor |

---

## 14. Observability & ops

- Health: `GET /api/v1/health` → `{ status: "ok", db: "up" }`
- Request ID middleware (`x-request-id`)
- Error tracking: optional Sentry later
- Metrics: request count/latency by route (Phase 2)

---

## 15. Implementation phases (engineering)

### Phase 0 — Foundations (≈ sprint 1)

- [ ] Postgres schema + migrations
- [ ] Auth login/me/refresh
- [ ] User roles + reporting_edges
- [ ] Seed script
- [ ] Policy module skeleton + unit tests

### Phase 1 — MVP API (≈ sprint 1–2)

- [ ] Tasks CRUD + soft delete
- [ ] Status machine + Close rules
- [ ] Admin role + hierarchy endpoints
- [ ] Integration test matrix §13.2

### Phase 2 — MVP UI (≈ sprint 2–3)

- [ ] Login
- [ ] Employee dashboard
- [ ] Task detail
- [ ] Manager team grid
- [ ] Admin console
- [ ] Design tokens from `Design.md`
- [ ] E2E smoke

### Phase 3 — Pilot harden

- [ ] HTTPS deploy
- [ ] Backups
- [ ] Rate limits
- [ ] Perf check on 50k task seed

### Post-MVP (Business Phase 2+)

- SSO (OIDC: Google / Azure AD)
- Soft-delete restore/export
- Notifications
- Admin global task override
- Multi-level hierarchy

---

## 16. Traceability (Business FR → Tech)

| Business ID | Technical delivery |
| --- | --- |
| FR-T1–T10 | `/tasks` CRUD + audit columns + error codes |
| FR-E1–E4 | Policy: owner-scoped; status enum filtered |
| FR-M1–M6 | `scope=team`, close transition, on-behalf create |
| FR-A1–A5 | `/admin/users*` + `user_roles` + `reporting_edges` |
| Soft delete decision | `deleted_at` / `deleted_by_id` |
| Q9 local auth | `/auth/login` email-password |
| Closed terminal | transition matrix deny |

---

## 17. Open technical questions

| # | Question | Recommendation | Status |
| --- | --- | --- | --- |
| TQ1 | Prisma vs Drizzle? | Prisma | Open — eng pick |
| TQ2 | Cookie auth vs localStorage Bearer? | httpOnly cookies | Open — prefer cookies |
| TQ3 | Monorepo vs single package? | Single package first, split later | Open |
| TQ4 | `due_date` DATE vs TIMESTAMPTZ? | DATE | Proposed locked |
| TQ5 | Allow Close only from DONE (not from IN_PROGRESS)? | **Yes — only from DONE** (matches matrix) | Proposed locked |
| TQ6 | Public registration? | Off | Proposed locked |
| TQ7 | Soft-delete second DELETE response? | 404 | Proposed locked |

Product-affecting items TQ4–TQ7 are treated as **locked** unless Product objects within review cycle.

---

## 18. Acceptance gate (technical)

MVP is **technically done** when:

- [ ] All Business PRD §18 checklist items demonstrable on deployed/staging build
- [ ] CI green: unit + integration matrix §13.2
- [ ] No task mutation path bypasses policy module
- [ ] Soft-deleted rows retained in DB with `deleted_at` set
- [ ] Seeded demo accounts work for Employee / Manager / Admin journeys
- [ ] API OpenAPI or equivalent route list documented (can be generated from Zod/Express)

---

## 19. Document change control

| Version | Date | Author | Summary |
| --- | --- | --- | --- |
| 1.0 | 2026-07-25 | Engineering / PM | Initial Technical PRD from Business PRD v1.1 |

**Change process:** Eng RFC → update this file → bump version → sync tickets. Behavior changes require Business PRD bump first.

---

*End of Technical PRD — TaskSync v1.0*
