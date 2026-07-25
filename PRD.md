# TaskSync — Business Product Requirements Document (PRD)

| Field | Value |
| --- | --- |
| **Product** | TaskSync — Enterprise Task Management Platform |
| **Document type** | Business PRD (Single Source of Truth) |
| **Version** | 1.1 |
| **Status** | Approved decisions locked — Ready for technical design |
| **Owner** | Program Management |
| **Last updated** | 2026-07-25 |
| **Audience** | Product, Engineering, Design, QA, Security, Leadership |

---

## 1. Purpose of this document

This PRD is the **single source of truth** for TaskSync’s business intent, scope, personas, permissions, acceptance criteria, and delivery priorities.

All design specs, technical designs, tickets, and test plans must align to this document. When conflict arises between artifacts, **this PRD wins** until formally revised and versioned.

**Related artifacts**

| Artifact | Role |
| --- | --- |
| `PRD.md` (this file) | Business requirements & acceptance (**behavior SSOT**) |
| `TECHNICAL_PRD.md` | Architecture, schema, APIs, authZ, test matrix (**engineering SSOT**) |
| `FRONTEND_TECHNICAL_PRD.md` | Frontend routes, screens, client RBAC, UX contracts (**FE SSOT**) |
| `Design.md` | Visual system, UI views, interaction patterns |
| Test Plan (future) | Verification mapped to acceptance criteria / §13 of Technical PRD |

---

## 2. Executive summary

TaskSync is an enterprise task management platform that enables organizations to create, assign, track, and close work with clear accountability and role-based controls.

Unlike consumer to-do apps, TaskSync is built for **organizational hierarchy**, **auditability**, and **RBAC**:

- **Employees** manage their own tasks through active work statuses.
- **Managers** oversee and govern tasks for direct reports, including closure and deletion.
- **Admins** configure and assign roles (Employee, Manager) across the organization.

**MVP outcome:** A secure, role-aware task CRUD system with a defined task lifecycle (`In Progress` → `Done` → `Closed`), audit fields, and managerial oversight of team tasks.

---

## 3. Problem statement

Enterprises need a simple, trustworthy way to track individual and team work with:

1. **Clear ownership** — who created/owns a task and who last changed it.
2. **Controlled lifecycle** — employees progress work; managers formally close it.
3. **Role separation** — not every user should administer access or close others’ work.
4. **Operational visibility** — managers need to see and act on tasks under their team.

Consumer task tools lack enterprise RBAC, reporting hierarchy, and formal closure governance. Spreadsheets and chat-based tracking lack audit trails and consistent status semantics.

---

## 4. Product vision & business goals

### 4.1 Vision

Become the default lightweight enterprise system of record for day-to-day task execution and managerial closure within a reporting hierarchy.

### 4.2 Business goals

| ID | Goal | Why it matters |
| --- | --- | --- |
| BG-1 | Enable employees to reliably create and progress personal work | Increases adoption and daily utility |
| BG-2 | Give managers authority over team task lifecycle (edit/delete/close) | Ensures accountability and completion governance |
| BG-3 | Centralize RBAC so Admins assign Employee/Manager access | Reduces shadow IT and permission sprawl |
| BG-4 | Establish auditable task records (created/modified/by whom) | Supports compliance and operational trust |
| BG-5 | Ship an MVP that is expandible to SSO, analytics, and workflows | Protects long-term platform investment |

### 4.3 Non-goals (MVP)

- Full project/portfolio management (epics, roadmaps, Gantt)
- Advanced workflow automation / approvals beyond Close by Manager
- Time tracking, billing, or capacity planning
- Customer-facing / external collaborator portals
- Mobile native apps (responsive web is in scope for MVP UX expectations)

---

## 5. Success metrics (MVP)

| Metric | Definition | Target (initial) |
| --- | --- | --- |
| Task creation rate | Avg. tasks created per active employee / week | Baseline + growth after pilot |
| Task completion rate | Tasks moved to `Done` within due date | ≥ 70% of due tasks in pilot cohort |
| Manager closure lag | Median time from `Done` → `Closed` | ≤ 3 business days |
| Permission correctness | Unauthorized action attempts blocked | 100% of RBAC test cases pass |
| Audit completeness | Tasks with Created / Modified / Last Modified By populated | 100% |
| Admin readiness | Org users assignable to Employee/Manager roles | 100% of invited users role-assigned |

Exact numeric OKRs may be refined during pilot kickoff; metric definitions above are fixed for MVP measurement design.

---

## 6. Personas

### 6.1 Employee

| Attribute | Detail |
| --- | --- |
| **Who** | Individual contributor executing assigned or self-created work |
| **Goals** | Capture tasks, update progress, mark work finished (`Done`) |
| **Pain points** | Unclear ownership, no single place for due dates/status, cannot formally archive without manager |
| **Primary jobs** | Create/edit/view/delete **own** tasks; set status to `In Progress` or `Done` |
| **Constraints** | **Cannot** set status to `Closed`; cannot manage other users’ tasks; no RBAC admin |

### 6.2 Manager

| Attribute | Detail |
| --- | --- |
| **Who** | People leader with a defined set of employee reports |
| **Dual role** | A Manager **is also an Employee** for their own personal tasks |
| **Goals** | Oversee team workload; correct/edit team tasks; formally close completed work; remove obsolete tasks |
| **Pain points** | No visibility into report tasks; cannot enforce closure; inconsistent status language |
| **Primary jobs** | All Employee capabilities **plus** Create/Edit/Delete/Close tasks for employees **under their management** |
| **Constraints** | Scope limited to **direct/reporting hierarchy** (team under them); cannot assign org-wide roles (Admin only) |

### 6.3 Admin

| Attribute | Detail |
| --- | --- |
| **Who** | System/organization administrator |
| **Goals** | Grant and maintain RBAC for Employee and Manager roles; keep access aligned to org structure |
| **Pain points** | Manual access chaos; unclear who can close/delete team work |
| **Primary jobs** | Assign/revoke **Employee** and **Manager** roles; manage user access relevant to TaskSync RBAC |
| **Constraints** | Admin focuses on **access control**; day-to-day task execution remains with Employee/Manager personas |

> **Clarification locked in this PRD:** Employee wording “can change status to In Progress, Done but [cannot] mark it as Closed” is the governing rule. Only Manager (for team scope) may set `Closed`. (Admin role assignment does not by itself imply Close authority unless the Admin also holds Manager/Employee as applicable — see §8.)

---

## 7. Scope

### 7.1 In scope (MVP)

1. User authentication via **local/email** for pilot (SSO deferred to Phase 2)
2. Roles: Employee, Manager, Admin
3. Reporting relationship: Manager ↔ Employees under them
4. Task CRUD with required fields and statuses
5. Status lifecycle rules enforced by role
6. Audit fields: Date Created, Date Modified, Last Modified By
7. Admin RBAC console to assign Employee / Manager roles
8. Views aligned to roles (Employee list, Manager team oversight, Admin RBAC) — see `Design.md`

### 7.2 Out of scope (MVP)

- Custom roles / fine-grained permission builder beyond the three roles
- Cross-team task visibility for non-managers
- Comments, attachments, @mentions (unless pulled forward by change request)
- Recurring tasks, subtasks, dependencies
- Slack/Teams deep integrations
- Advanced analytics dashboards beyond basic team counts (design may show placeholders; not required for MVP acceptance)

### 7.3 Future considerations (post-MVP)

- Google Workspace / Azure AD SSO (previewed in design)
- Priority, story points, rich markdown editor, activity feed
- Org-wide Admin task override
- Audit log export / compliance reports
- Notifications and digests

---

## 8. Role-Based Access Control (RBAC)

### 8.1 Role definitions

| Role | Description |
| --- | --- |
| **Employee** | Standard task worker; owns personal task CRUD (except Close) |
| **Manager** | Employee capabilities + team task governance for reports |
| **Admin** | Assigns Employee and Manager roles; administers access |

### 8.2 Capability matrix

| Capability | Employee | Manager (own tasks) | Manager (report tasks) | Admin |
| --- | --- | --- | --- | --- |
| View own tasks | ✅ | ✅ | — | ✅* |
| Create task (self as owner) | ✅ | ✅ | ✅ (on behalf of report — see note) | ✅* |
| Edit own task | ✅ | ✅ | — | ✅* |
| Delete own task | ✅ | ✅ | — | ✅* |
| Set status `In Progress` / `Done` (own) | ✅ | ✅ | — | ✅* |
| Set status `Closed` (own) | ❌ | ✅ | — | ❌† |
| View report tasks | ❌ | — | ✅ | ✅* |
| Edit report tasks | ❌ | — | ✅ | ✅* |
| Delete report tasks | ❌ | — | ✅ | ✅* |
| Set report task → `Closed` | ❌ | — | ✅ | ❌† |
| Assign Employee / Manager roles | ❌ | ❌ | ❌ | ✅ |
| Configure org hierarchy (manager↔reports) | ❌ | ❌ | ❌ | ✅ |

\* Admin task operations (**decided**): Admin is access/hierarchy administrator only in MVP. No global task override. Day-to-day task CRUD requires Employee and/or Manager role on the same account. Admin global override is Phase 3+.

† Close authority is **Manager-scoped** (self + reports). Employees never Close. Admins do not Close by virtue of Admin alone.

### 8.3 Manager dual-role rule

- Every Manager account includes **Employee** capabilities for their own tasks.
- Manager team powers apply only to users in their **managed employee set** (**single-level** direct reports for MVP; manager-of-managers deferred).
- A Manager cannot act on tasks of employees outside their hierarchy.
- A Manager **may create tasks on behalf of a report** (Owner/Assignee = report; Created By = Manager).

### 8.4 Admin RBAC responsibilities (acceptance)

Admin must be able to:

1. View organization members relevant to TaskSync.
2. Assign role **Employee**.
3. Assign role **Manager**.
4. Revoke or change Employee ↔ Manager assignment.
5. Associate Managers with the employees under them (hierarchy binding).

---

## 9. Domain model — Task

### 9.1 Required fields

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| **Name** | String | Yes | Human-readable title; non-empty after trim |
| **Description** | Text | No | Optional; present in UI/model; empty allowed |
| **Date Created** | DateTime (UTC) | System | Set once on create; immutable |
| **Date Modified** | DateTime (UTC) | System | Updated on every successful mutation |
| **Last Modified By** | User reference | System | User who performed the latest mutation |
| **Due Date** | Date or DateTime | No | Optional; encourage in UI; do not block create |
| **Status** | Enum | Yes | `In Progress` \| `Done` \| `Closed` |
| **Owner / Assignee** | User reference | Yes | Task belongs to an employee (creator by default; Manager may set a report) |
| **Created By** | User reference | System | User who created the task (may differ from Owner when Manager creates on behalf) |

**Decided:** Description and Due Date are **optional**. Name is the only user-required field to create a task.

### 9.2 Status enum

| Status | Meaning | Who can set |
| --- | --- | --- |
| **In Progress** | Work is active | Owner (Employee/Manager-as-Employee); Manager on report tasks |
| **Done** | Work finished; awaiting formal closure | Owner; Manager on report tasks |
| **Closed** | Formally complete / archived | **Manager only** (own or report tasks in scope) |

### 9.3 Status lifecycle

```
                 Employee / Manager (edit)
        ┌──────────────────────────────────┐
        │                                  │
        ▼                                  │
   [In Progress] ──────────────► [Done] ───┘
                                  │
                                  │ Manager only
                                  ▼
                              [Closed]  ← terminal (no reopen in MVP)
```

**MVP transition rules**

| From | To | Allowed actors |
| --- | --- | --- |
| (new) | `In Progress` | Creator with create permission (default on create) |
| `In Progress` | `Done` | Owner; Manager of owner |
| `Done` | `In Progress` | Owner; Manager of owner (reopen to active) |
| `Done` | `Closed` | Manager of owner (or Manager closing own task) |
| `Closed` | any | **Not allowed** — Closed is terminal for MVP |

**Default on create:** Status = `In Progress`.

### 9.4 Delete semantics (**decided: soft delete**)

- Deletes are **soft deletes**: task is removed from active lists but retained for audit/recovery in the data store.
- Employees may delete **own non-Closed** tasks (including `In Progress` and `Done`).
- Employees **cannot** delete `Closed` tasks.
- Managers may soft-delete own or report tasks in any status (including `Closed`).
- User-visible result: task no longer appears in active Employee/Manager lists.

---

## 10. Functional requirements

### 10.1 Task management (core)

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-T1 | Authenticated user can **Create** a task with Name and Status (default `In Progress`) | P0 |
| FR-T2 | Authenticated user can **View** tasks they are permitted to see | P0 |
| FR-T3 | Authenticated user can **Edit** permitted fields on tasks they can mutate | P0 |
| FR-T4 | Authenticated user can **Delete** tasks they are permitted to delete | P0 |
| FR-T5 | System sets **Date Created** on create | P0 |
| FR-T6 | System updates **Date Modified** and **Last Modified By** on every edit/status/delete metadata event | P0 |
| FR-T7 | User can set **Due Date** when creating/editing | P0 |
| FR-T8 | User can set/edit **Description** | P0 |
| FR-T9 | Status changes enforce RBAC and lifecycle rules in §9 | P0 |
| FR-T10 | Unauthorized actions return a clear denial (UI + API) | P0 |

### 10.2 Employee-specific

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-E1 | Employee can CRUD **own** tasks | P0 |
| FR-E2 | Employee can set status to `In Progress` or `Done` only | P0 |
| FR-E3 | Employee **cannot** set status to `Closed` (UI hidden/disabled + API rejected) | P0 |
| FR-E4 | Employee cannot view/edit/delete other employees’ tasks | P0 |

### 10.3 Manager-specific

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-M1 | Manager has all Employee capabilities for own tasks | P0 |
| FR-M2 | Manager can view tasks of employees under them | P0 |
| FR-M3 | Manager can create/edit/delete tasks for employees under them (including create **on behalf of** a report) | P0 |
| FR-M4 | Manager can set status to `Closed` for own tasks and report tasks | P0 |
| FR-M5 | Manager cannot access tasks outside their reporting hierarchy (direct reports only) | P0 |
| FR-M6 | Manager cannot reopen a `Closed` task | P0 |

### 10.4 Admin-specific

| ID | Requirement | Priority |
| --- | --- | --- |
| FR-A1 | Admin can assign Employee role to users | P0 |
| FR-A2 | Admin can assign Manager role to users | P0 |
| FR-A3 | Admin can revoke/change Employee/Manager roles | P0 |
| FR-A4 | Admin can define which employees report to which manager | P0 |
| FR-A5 | Non-Admin users cannot access Admin RBAC controls | P0 |

---

## 11. User stories & acceptance criteria

### 11.1 Epic: Task CRUD

**US-1 — Create task**  
As an Employee, I want to create a task so I can track work I need to finish.

**Acceptance criteria**

- Given I am authenticated as Employee, when I submit Name (required), optional Description and Due Date, then a task is created with Status `In Progress`.
- Date Created is set; Date Modified equals Date Created; Last Modified By is me.
- I can see the new task in my task list.

**US-2 — Edit task**  
As an Employee, I want to edit my task so details stay accurate.

**Acceptance criteria**

- I can change Name, Description, Due Date, and Status (`In Progress`/`Done`).
- Date Modified updates; Last Modified By becomes me.
- I cannot set Status to `Closed`.

**US-3 — View task**  
As a permitted user, I want to view task detail so I understand current state.

**Acceptance criteria**

- Detail shows: Name, Description, Date Created, Date Modified, Last Modified By, Due Date, Status.
- Users without permission cannot open the task.

**US-4 — Delete task**  
As an Employee, I want to delete my obsolete task so my list stays clean.

**Acceptance criteria**

- I can delete my own task (per delete rules in §9.4).
- Deleted task no longer appears in active lists.
- Another employee cannot delete my task.

### 11.2 Epic: Status & closure

**US-5 — Progress work**  
As an Employee, I want to mark a task `Done` when finished.

**Acceptance criteria**

- From `In Progress`, I can set `Done`.
- From `Done`, I can return to `In Progress`.
- `Closed` is not available in my status control.

**US-6 — Close task**  
As a Manager, I want to mark a report’s `Done` task as `Closed` so work is formally complete.

**Acceptance criteria**

- For an employee under me, I can set Status to `Closed` (from `Done` at minimum).
- Employee owner cannot perform this action.
- Last Modified By records me (the Manager).

**US-7 — Manager edits team task**  
As a Manager, I want to edit/delete a report’s task so I can correct or remove bad data.

**Acceptance criteria**

- I can edit Name/Description/Due Date/Status (including Close) for reports.
- I can delete a report’s task.
- I cannot do the same for an employee outside my hierarchy.

### 11.3 Epic: Admin RBAC

**US-8 — Assign roles**  
As an Admin, I want to grant Employee or Manager access so the right people can use TaskSync.

**Acceptance criteria**

- I can assign Employee role.
- I can assign Manager role.
- I can change a user from Employee to Manager (and reverse).
- Non-Admin cannot access this capability.

**US-9 — Bind hierarchy**  
As an Admin, I want to attach employees under a Manager so oversight works.

**Acceptance criteria**

- After binding, Manager sees those employees’ tasks.
- Before binding / after unbinding, Manager cannot access those tasks.

---

## 12. Information architecture & UX alignment

Primary experiences (detailed visuals in `Design.md`):

| View | Primary persona | Business purpose |
| --- | --- | --- |
| Employee Task Dashboard | Employee | Personal task create/progress |
| Manager Team Oversight Grid | Manager | Team visibility + close/delete |
| Task Details & Audit Panel | All permitted | Full fields + modification context |
| Admin Console & RBAC | Admin | Role and hierarchy management |
| Auth / Login | All | Secure access (SSO future) |

UX must enforce permissions in the UI (hide/disable illegal actions) **and** the backend must re-validate (never UI-only security).

---

## 13. Non-functional requirements (business-facing)

| ID | Category | Requirement |
| --- | --- | --- |
| NFR-1 | Security | All mutations authorize against role + ownership/hierarchy |
| NFR-2 | Auditability | Created/Modified/Last Modified By always accurate |
| NFR-3 | Reliability | Core CRUD available during business hours for pilot (define SLA in tech plan) |
| NFR-4 | Usability | Critical flows (create, status change, close, role assign) completable without training guide beyond short onboarding |
| NFR-5 | Accessibility | Align to WCAG AA targets described in `Design.md` |
| NFR-6 | Scalability (near-term) | Support pilot org size (suggest: ≤ 500 users, ≤ 50k tasks) without redesign |
| NFR-7 | Privacy | Users see only permitted tasks; no cross-tenant leakage (multi-tenant if applicable) |

---

## 14. Assumptions & locked decisions

1. Organization has a clear manager–employee reporting structure that Admin can encode.
2. One primary Manager per Employee; **single-level** direct reports only for MVP (no manager-of-managers).
3. “Closed” is a governance state, not merely “completed” — `Done` ≠ `Closed`; **Closed is terminal** (no reopen in MVP).
4. English-only UI for MVP.
5. Web application is the primary client.
6. Employee may soft-delete own **non-Closed** tasks (including `Done`); Managers soft-delete team tasks including `Closed`.
7. **Description** and **Due Date** are optional at create time; **Name** is required.
8. Manager may create tasks **on behalf of** a report (Owner = report).
9. Admin has **no** global task override in MVP (RBAC + hierarchy only).
10. Pilot auth is **local/email**; SSO is Phase 2.
11. Delete implementation is **soft delete**.

---

## 15. Constraints

1. MVP must ship the three roles and task field set listed in acceptance criteria.
2. Permission model must be enforceable server-side.
3. Design language should follow `Design.md` unless PRD and design conflict — then PRD behavior wins; visual tokens follow design.
4. No custom role builder in MVP.

---

## 16. Risks & mitigations

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Ambiguous Close permission | Wrong users close work | Lock rules in §8–§9; QA matrix tests |
| Unclear hierarchy data | Managers see wrong tasks | Admin hierarchy binding required before Manager oversight |
| Soft vs hard delete confusion | Audit/compliance gaps | Soft delete decided; UX shows remove-from-list only |
| Admin over-privileged on tasks | Accidental data changes | MVP Admin = RBAC + hierarchy only (no task override) |
| Scope creep (comments, SSO, analytics) | Delayed MVP | Park in §7.2 / roadmap; change-control via PRD revision |

---

## 17. Delivery phasing (program view)

### Phase 0 — Foundations
- Local/email auth, user model, roles schema, single-level hierarchy binding

### Phase 1 — MVP (this PRD)
- Task CRUD + audit fields (optional Description/Due Date)
- Soft delete
- Employee status rules (`In Progress` / `Done` only; Closed terminal)
- Manager team create-on-behalf / edit / delete / close
- Admin RBAC for Employee/Manager + hierarchy (no task override)

### Phase 2 — Enterprise hardening
- SSO (Google / Azure AD)
- Soft-delete audit export / recovery tooling
- Notifications on Due / Close

### Phase 3 — Collaboration & insights
- Comments/activity feed
- Manager analytics beyond basic counts
- Optional Admin global task override
- Multi-level hierarchy / reopen-Closed policy (if needed)

---

## 18. Acceptance checklist (MVP release gate)

A release is **MVP-complete** when all are true:

- [ ] User can **Create / Edit / View / Delete** a to-do per RBAC
- [ ] Task includes: **Name, Description, Date Created, Date Modified, Last Modified By, Due Date, Status**
- [ ] Status values exist: **In Progress, Done, Closed**
- [ ] Employee can set **In Progress** and **Done**, and **cannot** set **Closed**
- [ ] Manager (as Employee) can manage own tasks and **can Close**
- [ ] Manager can **create (incl. on behalf of report) / edit / delete / close** tasks for employees under them
- [ ] Manager cannot act on out-of-hierarchy employees (direct reports only)
- [ ] `Closed` tasks cannot be reopened
- [ ] Soft delete removes tasks from active lists while retaining audit data
- [ ] Description and Due Date are optional; Name is required
- [ ] Admin can grant **Employee** and **Manager** RBAC access and bind hierarchy (no global task override)
- [ ] Pilot auth is local/email
- [ ] Unauthorized actions are blocked in UI and API
- [ ] Audit fields update correctly on mutations

---

## 19. Resolved decisions (formerly open questions)

| # | Question | Decision | Decided |
| --- | --- | --- | --- |
| Q1 | Is Due Date mandatory? | **Optional** — encourage in UI, do not block create | 2026-07-25 |
| Q2 | Is Description mandatory? | **Optional** — Name is enough to create | 2026-07-25 |
| Q3 | Can Manager create a task on behalf of a report? | **Yes** — Owner/Assignee may be a report | 2026-07-25 |
| Q4 | Can Closed tasks be reopened? | **No** — Closed is terminal for MVP | 2026-07-25 |
| Q5 | Can Employee delete a `Done` task? | **Yes** — Employee may soft-delete own non-Closed tasks | 2026-07-25 |
| Q6 | Does Admin need global task override in MVP? | **No** — Admin = RBAC + hierarchy only | 2026-07-25 |
| Q7 | Multi-level hierarchy? | **Single-level** direct reports only | 2026-07-25 |
| Q8 | Soft delete vs hard delete? | **Soft delete** | 2026-07-25 |
| Q9 | Auth method for pilot? | **Local/email first**; SSO in Phase 2 | 2026-07-25 |

No open product questions remain for MVP scope. New questions require a PRD version bump.

---

## 20. Glossary

| Term | Definition |
| --- | --- |
| **Task / To-do** | Unit of work tracked in TaskSync |
| **Owner** | Employee user the task belongs to |
| **Report** | Employee under a Manager’s hierarchy |
| **Close** | Manager action setting status to `Closed` (formal completion) |
| **RBAC** | Role-Based Access Control |
| **Audit fields** | Date Created, Date Modified, Last Modified By |

---

## 21. Document change control

| Version | Date | Author | Summary |
| --- | --- | --- | --- |
| 1.0 | 2026-07-25 | Program Management | Initial Business PRD from product goals, personas, and acceptance criteria |
| 1.1 | 2026-07-25 | Program Management | Locked Q1–Q9 decisions; status Ready for technical design |

**Change process:** Propose edits → PM reviews → update this file → bump version → notify Eng/Design/QA.

---

*End of Business PRD — TaskSync v1.1*
