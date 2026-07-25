# TaskSync — Feature-based folder structure

Applications are organized **by feature**, not by component type. Reusable UI follows **Atomic Design**. State follows project rules: **Redux Toolkit + RTK Query**, **never Context API**. See [`.cursor/rules/rules.mdc`](./.cursor/rules/rules.mdc).

```
TaskSync/
├── PRD.md
├── TECHNICAL_PRD.md
├── FRONTEND_TECHNICAL_PRD.md
├── FE_TASKS.md
├── Design.md
├── STRUCTURE.md                 # This file
├── .cursor/rules/rules.mdc
│
└── src/
    ├── main.tsx
    ├── index.css                # Tailwind + CSS variables only
    │
    ├── app/
    │   ├── App.tsx
    │   ├── providers/           # Redux <Provider> + Router (no Context)
    │   ├── store/               # configureStore, hooks.ts
    │   ├── router/
    │   └── layouts/
    │
    ├── features/                # Feature-first
    │   ├── auth/
    │   │   ├── api/             # authApi (RTK Query injectEndpoints)
    │   │   ├── components/
    │   │   ├── pages/
    │   │   ├── types/
    │   │   └── index.ts
    │   ├── tasks/
    │   ├── team/
    │   └── admin/
    │
    ├── shared/
    │   ├── api/
    │   │   └── baseApi.ts       # createApi — server-data cache root
    │   ├── ui/                  # Atomic Design
    │   │   ├── atoms/
    │   │   ├── molecules/
    │   │   └── organisms/
    │   └── lib/                 # cn(), permissions.ts, formatters
    │
    ├── shared-kernel/           # Zod / enums / DTOs
    │   ├── schemas/
    │   └── index.ts
    │
    └── mocks/                   # MSW (FE-first)
        ├── browser.ts
        ├── handlers/
        └── seed.ts
```

## Feature → product map

| Feature | Routes / screens | Personas |
| --- | --- | --- |
| `auth` | `/login` | All |
| `tasks` | `/tasks`, `/tasks/:id` | Employee, Manager (own) |
| `team` | `/team` | Manager |
| `admin` | `/admin` | Admin |

## Rules

1. **Import across features only via `index.ts`.**
2. **Atomic Design:** atoms/molecules/organisms in `shared/ui`; features compose pages.
3. **Promote to `shared/ui` only when a second feature needs the same primitive.**
4. **RTK Query** owns server-data caching (`providesTags` / `invalidatesTags`). Do not mirror entities in hand-written slices.
5. **Never use React Context API** for auth or domain state.
6. **No inline CSS** — Tailwind only.
7. **Vitest** for unit/component tests; **ESLint** must pass.

## RTK Query placement

```
shared/api/baseApi.ts          → createApi, tagTypes, baseQuery
features/auth/api/authApi.ts   → injectEndpoints
features/tasks/api/tasksApi.ts
features/team/api/teamApi.ts
features/admin/api/adminApi.ts
app/store/index.ts             → configureStore({ reducer: { [baseApi.reducerPath]: baseApi.reducer }, middleware })
```
