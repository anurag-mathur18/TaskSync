# Design Screens → routes & features

Base path: `/Users/anuragm/Downloads/Design Screens` (workspace folder `Design Screens`).

Each screen folder contains `code.html` + `screen.png` unless noted.

| Design folder | Route | Feature | Notes |
| --- | --- | --- | --- |
| `login_desktop` | `/login` | `auth` | Primary login reference |
| `signup` / `signup_desktop` | — | `auth` | Visual reference only if signup is in MVP; check FE PRD before building |
| `my_tasks_desktop` | `/tasks` | `tasks` | Employee/Manager own tasks |
| `task_details_desktop` | `/tasks/:id` | `tasks` | Task detail |
| `team_oversight_desktop` | `/team` | `team` | Manager team list |
| `manager_approval` / `manager_approval_desktop` | `/team` or task detail Close flow | `team` / `tasks` | Map Close/approval actions to FE PRD §6.3–6.4 — may be a state of team/detail, not a separate route |
| `user_management_desktop` | `/admin` | `admin` | RBAC / hierarchy |
| `system_audit_log` / `system_audit_log_desktop` | — | `admin` | Out of MVP unless FE PRD adds it; do not invent a route without PRD backing |
| `protask_enterprise/` | — | — | `DESIGN.md` tokens only (no screen) |

## Choosing desktop vs mobile

- Default: `*_desktop` folder.
- Folders without `_desktop` (`signup`, `manager_approval`, `system_audit_log`) are alternate/mobile-oriented mocks — use for responsive checks, not as a second page implementation.
