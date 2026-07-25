---
name: design-screens
description: Implement TaskSync UI screens from the Design Screens workspace folder (code.html + screen.png). Use when building, porting, or coding a screen from design HTML/PNG, when the user mentions Design Screens, design mockups, or implementing login, signup, my tasks, task details, manager approval, team oversight, user management, or audit log UI.
---

# Design Screens → TaskSync Implementation

Implement product UI from the **Design Screens** workspace folder into TaskSync React code. Designs are visual/layout reference — not drop-in HTML.

## Design source

Path (workspace root): `Design Screens/` (absolute: `/Users/anuragm/Downloads/Design Screens`).

| Asset | Role |
| --- | --- |
| `<screen>/screen.png` | Visual truth — layout, hierarchy, spacing, density |
| `<screen>/code.html` | Structure, Tailwind class intent, component breakdown |
| `protask_enterprise/DESIGN.md` | Tokens mirrored in repo `Design.md` |
| Repo `Design.md` | **Token SSOT** for the app |
| `FRONTEND_TECHNICAL_PRD.md` §6 | Behavior, RBAC, routes (wins over decorative mock details) |
| `STRUCTURE.md` + `.cursor/rules` | Feature-first, Atomic Design, RTK |

Screen folder → feature/route map: [screen-map.md](screen-map.md).

## Workflow

Copy and track:

```
Design → Code:
- [ ] 1. Identify screen folder(s) from [screen-map.md](screen-map.md)
- [ ] 2. Read screen.png (Read tool — inspect the image)
- [ ] 3. Read code.html (structure + classes only)
- [ ] 4. Read Design.md tokens + FRONTEND_TECHNICAL_PRD §6 for that route
- [ ] 5. Reuse existing shared/ui atoms/molecules/organisms first
- [ ] 6. Implement in the correct features/*/pages|components
- [ ] 7. Wire RTK Query / forms per FE PRD (not static HTML content)
- [ ] 8. Visually match PNG; verify tokens, density, and RBAC
```

### Step details

1. **Pick the folder** — Prefer `*_desktop` when both mobile and desktop exist unless the user asks for mobile.
2. **Read the PNG** — Treat it as the layout target. Note sidebar, header, density, chip styles, empty states.
3. **Read HTML as reference** — Extract sections, hierarchy, and spacing intent. Do **not** copy the file into the app, keep CDN Tailwind/scripts, or paste Material Symbols markup.
4. **Adapt to stack** — TypeScript React, Tailwind utilities / CSS vars from `Design.md`, `lucide-react` icons (not Material Symbols), React Hook Form + Zod where forms exist, RTK Query for data.
5. **Place code correctly**
   - Pages: `features/<feature>/pages/`
   - Feature-only UI: `features/<feature>/components/`
   - Reuse across ≥2 features: promote to `shared/ui/{atoms|molecules|organisms}/`
6. **Wire behavior** — Mock/static labels in HTML become real data via RTK Query hooks. Hide/disable illegal actions per FE PRD RBAC.

## Hard rules

- **Do not** ship raw `code.html` or CDN Tailwind config into the Vite app.
- **Do not** use inline CSS or CSS-in-JS.
- **Do not** use React Context API.
- **Do** use Redux Toolkit + RTK Query for server state.
- **Do** match colors/type/radius/spacing to `Design.md` token names (`primary`, `surface-container-low`, etc.).
- **Do** preserve enterprise density (task rows ~40–48px) from the PNG.
- Behavior conflicts: **PRD / FRONTEND_TECHNICAL_PRD** over decorative mock copy.
- Token conflicts: **`Design.md`** over HTML hard-coded one-offs.

## Adaptation cheatsheet

| Design HTML | TaskSync |
| --- | --- |
| Tailwind CDN + `tailwind.config` colors | App Tailwind + CSS vars from `Design.md` |
| Material Symbols Outlined | `lucide-react` |
| Static lists / fake users | RTK Query + MSW |
| Full-page HTML shell | `AppShell` / `AuthLayout` + page component |
| Mobile + desktop duplicate folders | One responsive React page unless FE PRD says otherwise |

## Done when

- Layout and visual hierarchy match `screen.png` at desktop width
- Tokens match `Design.md`
- Screen lives in the correct feature folder and route
- Interactive pieces use project data/forms patterns (not hard-coded demo strings left as the only source of truth)
- ESLint-clean TypeScript; no inline styles
