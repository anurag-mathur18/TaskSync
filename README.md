# TaskSync

Enterprise task management platform.

## Quick start

```bash
cp .env.example .env
npm install
npm run dev
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | ESLint |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest watch mode |

Path alias: `@/` → `src/`. Env: see `.env.example` (`VITE_API_BASE_URL`, `VITE_USE_MOCK_API`).

## Host on GitHub Pages

The frontend is a static Vite build, so GitHub can host it for free. This repo already has a workflow that builds and deploys on every push to `main` or `dev`.

### One-time setup (do this in the GitHub UI)

1. Push these changes to GitHub (`git push`).
2. Open the repo → **Settings** → **Pages**.
3. Under **Build and deployment** → **Source**, choose **GitHub Actions** (not “Deploy from a branch”).
4. Open the **Actions** tab, wait for **Deploy to GitHub Pages** to finish (or run it via **Run workflow**).
5. Visit: [https://anurag-mathur18.github.io/TaskSync/](https://anurag-mathur18.github.io/TaskSync/)

### How it works (short lesson)

| Piece | What it does |
| --- | --- |
| `vite.config.ts` `base` | Assets load from `/TaskSync/` on Pages instead of `/`. Locally `base` stays `/`. |
| Router `basename` | React Router matches routes under `/TaskSync` (e.g. `/TaskSync/login`). |
| MSW `serviceWorker.url` | Mock API worker is served from the same subdirectory. |
| `.github/workflows/deploy-pages.yml` | On push: `npm ci` → `npm run build` → upload `dist/` → publish to Pages. |
| `dist/404.html` | Copy of `index.html`. On refresh of a deep URL, Pages serves this so the SPA can boot and the router takes over. |

Production build on Pages uses **mock API** (`VITE_USE_MOCK_API=true`) so the demo works without a backend. When you have a real API, set `VITE_USE_MOCK_API=false` and `VITE_API_BASE_URL` to that API’s URL in the workflow.

### Preview the Pages build locally

```bash
VITE_BASE_PATH=/TaskSync/ npm run build
npx serve dist -s
# then open http://localhost:3000/TaskSync/
```

## Docs

| Document | Purpose |
| --- | --- |
| [PRD.md](./PRD.md) | Business PRD (behavior SSOT) |
| [TECHNICAL_PRD.md](./TECHNICAL_PRD.md) | Technical PRD (engineering SSOT) |
| [FRONTEND_TECHNICAL_PRD.md](./FRONTEND_TECHNICAL_PRD.md) | Frontend Technical PRD (FE SSOT) |
| [Design.md](./Design.md) | Design system |
| [STRUCTURE.md](./STRUCTURE.md) | Feature-based folder layout |
| [FE_TASKS.md](./FE_TASKS.md) | Granular FE tasks FS01–FS92 (mock API first, RTK Query) |
| [.cursor/rules/rules.mdc](./.cursor/rules/rules.mdc) | Mandatory: RTK, no Context, Atomic Design, Vitest, Tailwind |

## Source layout

Code lives under `src/`, organized **by feature** (`auth`, `tasks`, `team`, `admin`), not by component type. See [STRUCTURE.md](./STRUCTURE.md).
