# TaskSync — Frontend Implementation Tasks (Mock API First)

| Field | Value |
| --- | --- |
| **Document** | Granular FE task backlog |
| **Version** | 1.1 |
| **Date** | 2026-07-25 |
| **Strategy** | Frontend-first with **mocked API** (MSW); **Redux Toolkit + RTK Query** for store & server-data cache |
| **Sources** | [`FRONTEND_TECHNICAL_PRD.md`](./FRONTEND_TECHNICAL_PRD.md), [`PRD.md`](./PRD.md), [`Design.md`](./Design.md), [`STRUCTURE.md`](./STRUCTURE.md), [`.cursor/rules/rules.mdc`](./.cursor/rules/rules.mdc) |
| **ID scheme** | `FS##` = Frontend Story / task |

**Engineering rules (mandatory):** TypeScript · Redux Toolkit · RTK Query · no Context API · Feature-first · Atomic Design · Vitest · ESLint · Tailwind · no inline CSS.

---

## How to use

1. Work **in ID order** within each epic (respect Depends on).
2. Each task is **one PR-sized** unit unless noted.
3. Mock layer (`FS20–FS27`) must behave like Technical PRD contracts so features do not hardcode fake data in UI.
4. Definition of Done for every task: code in feature folders, TypeScript clean, matches Design tokens where UI is involved.

**Status legend:** `Todo` · `In Progress` · `Done` · `Blocked`

---

## Epic map

| Epic | IDs | Goal |
| --- | --- | --- |
| E0 Scaffold | FS01–FS08 | Runnable Vite app + RTK store + feature folders |
| E1 Design system | FS09–FS16 | Tokens, fonts, Atomic Design UI |
| E2 Mock API + RTK Query | FS17–FS24 | MSW + `baseApi` + feature endpoints + cache tags |
| E3 App shell | FS25–FS30 | Router, guards, layouts, nav |
| E4 Auth | FS31–FS36 | Login / session / logout |
| E5 Permissions | FS37–FS39 | Client RBAC helpers + unit tests |
| E6 Tasks | FS40–FS52 | My Tasks + Detail CRUD (Employee) |
| E7 Team | FS53–FS60 | Manager oversight + Close + create-on-behalf |
| E8 Admin | FS61–FS67 | Roles + hierarchy UI |
| E9 Motion & states | FS68–FS72 | Motion, loading/empty/error polish |
| E10 A11y | FS73–FS78 | WCAG AA pass on core flows | Done |
| E11 Tests | FS79–FS88 | Unit, component, MSW integration |
| E12 Acceptance | FS89–FS92 | FE checklist sign-off |

---

## E0 — Scaffold (FE-0)

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS01** | Initialize Vite + React 19 + TS | Create/align `package.json`, `vite.config.ts`, `tsconfig` strict, `index.html`, entry `src/main.tsx` | — | S | Done |
| **FS02** | Add Tailwind CSS 4 | Wire `@tailwindcss/vite`; base `src/index.css` | FS01 | S | Done |
| **FS03** | Confirm feature folder tree | Ensure `STRUCTURE.md` folders exist; remove dead placeholders as needed | FS01 | XS | Done |
| **FS04** | Add core FE deps | `react-router`, **`@reduxjs/toolkit`**, **`react-redux`**, `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react`, `motion`, `clsx`/`tailwind-merge`, `sonner` — **not** TanStack Query | FS01 | S | Done |
| **FS05** | Add test tooling | **Vitest**, RTL, `jsdom`, `@testing-library/user-event`, MSW; scripts `test`, `test:watch` | FS04 | S | Done |
| **FS06** | Path aliases | `@/` → `src/`; document in `tsconfig` + Vite | FS01 | XS | Done |
| **FS07** | Env config | `.env.example` with `VITE_API_BASE_URL=/api/v1`, `VITE_USE_MOCK_API=true` | FS01 | XS | Done |
| **FS08** | ESLint baseline | ESLint + Tailwind-aware rules; `npm run lint` green; enforce no inline style props where possible | FS01 | S | Done |

---

## E1 — Design system (`Design.md`)

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS09** | CSS design tokens | Map `Design.md` colors to `:root` CSS variables (primary `#003d9b`, surfaces, outline, error, status) | FS02 | M | Done |
| **FS10** | Tailwind theme bridge | Extend Tailwind theme to consume CSS variables (colors, radius, spacing 4px base) | FS09 | M | Done |
| **FS11** | Load fonts | IBM Plex Sans, Inter, JetBrains Mono; utility classes for display/headline/body/label | FS02 | S | Done |
| **FS12** | `cn()` helper | `shared/lib/cn.ts` (clsx + twMerge) | FS04 | XS | Done |
| **FS13** | Atoms: `Button` | `shared/ui/atoms/Button` — variants; focus ring; Tailwind only | FS10, FS12 | S | Done |
| **FS14** | Atoms + molecules: forms | `TextInput`, `TextArea`, `Select`, `FormField` with errors | FS13 | M | Done |
| **FS15** | Molecules + organisms feedback | `StatusChip`, `EmptyState`, `Skeleton`, `PageHeader`, `ConfirmDialog`, Toast (`sonner`) | FS13 | M | Done |
| **FS16** | Organism: `DataTable` | Header, row hover `primary/5`, a11y column headers | FS13 | M | Done |

---

## E2 — Mock API + RTK Query cache

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS17** | `shared-kernel` enums + DTOs | `Role`, `TaskStatus`, `TaskDto`, Zod schemas | FS04 | M | Done |
| **FS18** | Redux store + `baseApi` | `configureStore`; `createApi` + `fetchBaseQuery`; tagTypes; typed hooks — **no Context** | FS04, FS17 | M | Done |
| **FS19** | Cache tags contract | Document/provide `'Me'`, `'Task'`, `'TaskList'`, `'TeamTaskList'`, `'AdminUser'`, `'Report'` | FS18 | S | Done |
| **FS20** | MSW bootstrap | Worker when `VITE_USE_MOCK_API=true` | FS05 | S | Done |
| **FS21** | Seed users & hierarchy | admin, manager, alex, sam, outsider | FS20 | S | Done |
| **FS22** | `authApi` + mock auth | `getMe`, `login`, `logout` injectEndpoints; MSW handlers | FS18, FS21 | M | Done |
| **FS23** | `tasksApi` + mock tasks | CRUD + soft delete + status; tags + optimistic helpers; MSW RBAC | FS18, FS21 | L | Done |
| **FS24** | `adminApi` / `teamApi` mocks | Users, roles, manager bind, team list, reports | FS18, FS21 | M | Done |

**Mock DoD:** Employee cannot Close (403); Manager can Close Done→Closed; soft-deleted tasks 404 on GET; outsider tasks invisible to manager.

---

## E3 — App shell & routing

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS25** | `AppProviders` | `<Provider store={store}>` + Router only — **never Context** | FS18 | S | Done |
| **FS26** | Router skeleton | Routes: `/login`, `/`, `/tasks`, `/tasks/:id`, `/team`, `/admin`, `*` 404 | FS04 | S | Done |
| **FS27** | `AuthLayout` | Centered auth chrome for login (Design View 5 vibe) | FS10, FS26 | S | Done |
| **FS28** | `AppShell` | Desktop sidebar 260px; mobile bottom nav; outlet; TaskSync brand | FS10, FS26 | M | Done |
| **FS29** | Route guards | `RequireAuth`, `RequireGuest`, `RequireManager`, `RequireAdmin`; safe `returnUrl` (relative only) | FS26, FS22 | M | Done |
| **FS30** | Role-filtered nav | My Tasks / Team / Admin links by role; Admin-only lands on `/admin` | FS28, FS29 | S | Done |

---

## E4 — Auth feature

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS31** | Session via `useGetMeQuery` | RTK Query cache as session SSOT; export selectors/helpers from `features/auth` | FS19, FS22 | S | Done |
| **FS32** | Login page UI | Email + password; SSO buttons disabled “Coming soon”; Design tokens | FS14, FS27 | M | Done |
| **FS33** | Login mutation | RHF + Zod; call mock login; invalidate me; redirect `returnUrl` or `/tasks` | FS32, FS31 | M | Done |
| **FS34** | Logout | User menu action; POST logout; clear queries; `/login` | FS31, FS28 | S | Done |
| **FS35** | Auth error UX | Generic “Invalid credentials”; clear password field; no email enumeration | FS33 | S | Done |
| **FS36** | Auth feature barrel | Public exports via `features/auth/index.ts` only | FS31–FS35 | XS | Done |

---

## E5 — Client permissions (Business PRD RBAC)

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS37** | Implement `permissions.ts` | All helpers from FE PRD §7 (`canCloseTask`, `canDeleteTask`, `getAllowedStatusOptions`, etc.) | FS17 | M | Done |
| **FS38** | Unit tests — permissions matrix | Employee/Manager/Admin × own/report/Closed; Close only from Done | FS37, FS05 | M | Done |
| **FS39** | Unit tests — status options | Employee never sees Closed; Closed → empty options | FS37 | S | Done |

---

## E6 — Tasks feature (Employee + own Manager)

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS40** | `tasksApi` feature module | Ensure list/get/create/patch/delete endpoints + tags wired | FS18, FS23 | S | Done |
| **FS41** | Task hooks usage | Pages use `useGetMyTasksQuery`, `useGetTaskQuery`, mutations — no manual cache | FS40, FS19 | M | Done |
| **FS42** | `TaskStatusBadge` | Maps IN_PROGRESS / DONE / CLOSED to Design status chips | FS15 | S | Done |
| **FS43** | `TaskRow` | Name, due, status, checkbox shortcut; hover; link to detail | FS42, FS37 | M | Done |
| **FS44** | My Tasks page | List + filters All/In Progress/Done; greeting; skeletons | FS41, FS43, FS28 | M | Done |
| **FS45** | Empty / error states — My Tasks | Empty CTA; Retry banner | FS44, FS15 | S | Done |
| **FS46** | Create task drawer/modal | Name required; Description/Due optional; responsive (FQ2) | FS14, FS41 | M | Done |
| **FS47** | Task Detail page — read | All audit fields; Owner; Created By when ≠ Owner; breadcrumb | FS41, FS11 | M | Done |
| **FS48** | Task Detail — edit | PATCH name/description/dueDate; Save disabled while pending | FS47, FS41 | M | Done |
| **FS49** | Status control (Employee) | Only In Progress / Done; no Close | FS48, FS37 | S | Done |
| **FS50** | Soft delete UX | ConfirmDialog copy; remove from list; Closed non-deletable for Employee | FS48, FS37 | S | Done |
| **FS51** | Manager Close on own Done | Close action on Detail + My Tasks when `canCloseTask` | FS49, FS37 | S | Done |
| **FS52** | Closed read-only UI | Terminal: no reopen; fields locked; Manager may still delete | FS51 | S | Done |

---

## E7 — Team feature (Manager)

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS53** | Team API + hooks | `scope=team` list; filters ownerId/status | FS40 | S | Done |
| **FS54** | Team Oversight page shell | Header metrics placeholders; DataTable columns | FS16, FS28, FS29 | M | Done |
| **FS55** | Team grid rows + actions | Open detail; inline Close when Done; Delete confirm | FS54, FS37, FS41 | M | Done |
| **FS56** | Assignee / status filters | Reports dropdown from `me.reportIds`; status multi | FS54, FS31 | S | Done |
| **FS57** | Create on behalf of report | Owner picker = direct reports only; Name required | FS46, FS37 | M | Done |
| **FS58** | Team empty states | No reports vs no tasks messaging | FS54 | S | Done |
| **FS59** | Hide Team from Employees | Nav + guard verified | FS30, FS29 | XS | Done |
| **FS60** | Optimistic status + undo | RTK Query `onQueryStarted` + `patchResult.undo()` on 403/409 | FS41, FS55 | M | Done |

---

## E8 — Admin feature

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS61** | Admin API + hooks | users list, patch roles, put manager | FS18, FS24 | S | Done |
| **FS62** | User Management page | Members table: name, email, roles, manager | FS16, FS61, FS29 | M | Done |
| **FS63** | Role assignment UI | Toggle Employee/Manager; Manager implies Employee in UI | FS62 | M | Done |
| **FS64** | Hierarchy bind UI | Assign/clear manager per employee | FS62 | M | Done |
| **FS65** | Client search filter | Filter members by name/email | FS62 | XS | Done |
| **FS66** | Admin-only: no task UI | No create/list tasks from Admin; dual-role users still see Tasks/Team nav | FS30, FS62 | S | Done |
| **FS67** | Hide Admin from non-admins | Nav + guard | FS30, FS29 | XS | Done |

---

## E9 — Motion & UX polish

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS68** | M1 Button press motion | `whileTap` scale 0.95 on shared Button | FS13 | XS | Done |
| **FS69** | M2 Checkbox complete | Green transition on Done checkbox | FS43 | S | Done |
| **FS70** | M3 Row hover | Task list + team/admin tables `bg-primary/5` | FS43, FS16 | XS | Done |
| **FS71** | M4 Route fade | Outlet opacity transition 150ms | FS28 | S | Done |
| **FS72** | Toast mapping | Map RTK/`FetchBaseQueryError` → sonner (403/409/404/network) | FS18, FS15 | S | Done |

---

## E10 — Accessibility

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS73** | Focus rings audit | `focus-visible:ring-2` primary on all interactive controls | FS13–FS16 | S | Done |
| **FS74** | Labels & forms a11y | Every input labeled; errors linked via `aria-describedby` | FS14, FS32, FS46 | S | Done |
| **FS75** | Dialog a11y | ConfirmDialog: focus trap, `aria-modal`, Esc, restore focus | FS15, FS50 | S | Done |
| **FS76** | Status not color-only | Chips always include text label | FS42 | XS | Done |
| **FS77** | Touch targets mobile | Nav, FAB, row actions ≥ 44×44px | FS28, FS44 | S | Done |
| **FS78** | Landmark & keyboard pass | `nav`/`main`; tab through Login → Tasks → Detail → Team → Admin flows | FS30–FS67 | M | Done |

---

## E11 — Unit & integration tests

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS79** | Zod schema unit tests | Empty name reject; optional description/dueDate accept | FS17 | S | Todo |
| **FS80** | `StatusChip` component tests | Renders correct labels for 3 statuses | FS42 | S | Todo |
| **FS81** | TaskRow RBAC visibility tests | Employee: no Close; Manager Done: Close visible | FS43, FS37 | M | Todo |
| **FS82** | MSW: Employee create → Done | Integration: Closed option absent | FS44, FS23 | M | Todo |
| **FS83** | MSW: Manager Close report task | Close PATCH called; UI updates | FS55, FS23 | M | Todo |
| **FS84** | MSW: Admin guard | Non-admin redirected from `/admin` | FS29, FS62 | S | Todo |
| **FS85** | MSW: 403 rollback | Optimistic status rolls back + toast | FS60 | M | Todo |
| **FS86** | Login form tests | Validation + success redirect (mocked) | FS33 | S | Todo |
| **FS87** | Soft-delete list update test | Deleted task leaves list | FS50 | S | Todo |
| **FS88** | CI test script | `npm test` runs unit+component+MSW suites green | FS79–FS87 | S | Todo |

---

## E12 — Acceptance & handoff

| ID | Task | Details | Depends | Estimate | Status |
| --- | --- | --- | --- | --- | --- |
| **FS89** | Walk FE acceptance checklist | Complete §16 of Frontend Technical PRD against mock | FS52, FS60, FS67, FS78 | M | Todo |
| **FS90** | Seed demo script in README | How to login as Employee / Manager / Admin with mock | FS21 | S | Todo |
| **FS91** | Mock → real API switch doc | Flip `VITE_USE_MOCK_API=false`; no feature rewrites expected | FS18, FS20 | S | Todo |
| **FS92** | FE MVP sign-off | PM/FE checklist signed; open FQ1–FQ4 resolved or deferred | FS89 | S | Todo |

---

## Suggested sprint slices

| Sprint | Tasks | Outcome |
| --- | --- | --- |
| **S1** | FS01–FS24 | App boots; design tokens; **mock API ready** |
| **S2** | FS25–FS39 | Shell + login + permissions tested |
| **S3** | FS40–FS52 | Employee My Tasks + Detail complete |
| **S4** | FS53–FS67 | Manager Team + Admin RBAC |
| **S5** | FS68–FS92 | Motion, a11y, tests, acceptance |

---

## Traceability (task → requirement)

| Business / FE req | Covered by |
| --- | --- |
| FR-T1–T10 Task CRUD + audit fields | FS40–FS52 |
| FR-E1–E4 Employee no Close | FS37–FS39, FS49, FS81–FS82 |
| FR-M1–M6 Manager team/close/on-behalf | FS51–FS60, FS83 |
| FR-A1–A5 Admin RBAC | FS61–FS67, FS84 |
| Soft delete | FS23, FS50, FS87 |
| Design tokens / status chips | FS09–FS16, FS42 |
| WCAG AA | FS73–FS78 |
| FE PRD testing §14 | FS38–FS39, FS79–FS88 |

---

## Estimates key

| Size | Meaning |
| --- | --- |
| XS | &lt; 2 hours |
| S | ~½ day |
| M | ~1–2 days |
| L | ~3 days |

---

## Change log

| Version | Date | Summary |
| --- | --- | --- |
| 1.0 | 2026-07-25 | Initial FS01–FS92 backlog for mock-API FE-first delivery |
| 1.1 | 2026-07-25 | Align to rules.mdc: Redux Toolkit + RTK Query cache, Atomic Design, no Context |

---

*Implement in `TaskSync/` per `STRUCTURE.md`. Mark Status in this file or mirror IDs in your tracker.*
