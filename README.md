# Truesight.Challenge2

Optimized version of the Truesight.Challenge codebase — the **Truesight University** rewards platform: a React frontend with Firebase Cloud Functions where students create study projects, take AI-generated quizzes, earn points, and redeem rewards. Three roles share the app: Institute admins, Level‑1 (teacher) users, and Level‑2 (student) users.

The REST backend that serves `/api/*` is a separate service and is **not** part of this repository.

## Stack

- React 18 (Create React App / `react-scripts` 5), React Router 6, Tailwind CSS 3
- Firebase JS SDK (Auth, Firestore, Storage)
- Firebase Cloud Functions (`functions/`) for transactional email and rewards management

## Getting started

```bash
npm ci          # install frontend dependencies
npm start       # dev server on http://localhost:3000
npm run build   # production build into build/
```

Cloud Functions:

```bash
cd functions
npm ci
npm run serve   # local emulator (requires the Firebase CLI)
```

### Environment variables

Create a `.env` file in the repo root (CRA reads `REACT_APP_*` at build time):

| Variable | Purpose |
| --- | --- |
| `REACT_APP_BACKEND_URL` | Base URL of the REST API (defaults to `http://localhost:5001`) |
| `REACT_APP_FIREBASE_API_KEY` | Firebase web app config |
| `REACT_APP_FIREBASE_AUTH_DOMAIN` | Firebase web app config |
| `REACT_APP_FIREBASE_PROJECT_ID` | Firebase web app config |
| `REACT_APP_FIREBASE_STORAGE_BUCKET` | Firebase web app config |
| `REACT_APP_FIREBASE_MESSAGING_SENDER_ID` | Firebase web app config |
| `REACT_APP_FIREBASE_APP_ID` | Firebase web app config |
| `REACT_APP_GOOGLE_SHEETS_WEBHOOK_URL` | Optional webhook for demo-request submissions |

The Cloud Functions read their email/SMTP credentials from `functions.config()` (`gmail.email`, `gmail.password`, `smtp.*`, `app.url`).

## What was optimized

This repo is a conservative optimization of the original codebase: same dependencies, same behavior, verified by production builds at every step.

- **Route-level code splitting** (`src/App.js`): every section except the landing and login pages loads on first navigation via `React.lazy`. Initial main bundle: **369.34 kB → 231.29 kB gzipped (−37%)**.
- **Deduplicated components** (`src/pages/shared/components/`): the Level‑1 and Level‑2 copies of `Settings`, `MyCollaborations`, and `Profile` were near-identical and are now single shared components (~990 duplicated lines removed). `Profile` takes a `variant` prop that selects the blue (Level‑1) or indigo (Level‑2) styling. The remaining Level‑1/Level‑2 pairs (Dashboard, Quiz, Challenges, PrivateProjects, Trash, AllProjects, Project) differ behaviorally and were deliberately kept separate.
- **Render-performance fixes**: `useProjectSearch` returns its memoized result directly instead of mirroring it through state; the inline `Card` components in the three dashboards were hoisted to module scope (they previously remounted on every render); `stats` arrays and repeated list filters are memoized.
- **Cloud Functions** (`functions/index.js`): `initializeRewards` no longer issues one Firestore query per reward inside a loop (~15 sequential reads → 1); the callable and HTTP variants of `getRewards` share one `fetchAccessibleRewards` helper; the two email templates share their common CSS, with rendered output verified identical.
- **Dead code removed**: 10 unimported files (including a broken `searchUtils.js` that imported itself) and an 80-line commented-out component; debug `console.log` calls stripped from `src/` (error reporting via `console.error`/`console.warn` kept).
- **Reproducible functions installs**: `functions/package-lock.json` is now committed so `npm ci` works there.
- **DEP0176 fix for Node 23+ builds**: `react-dev-utils` (an archived CRA dependency) uses the deprecated top-level `fs.F_OK`, which makes newer Node print `[DEP0176] DeprecationWarning` on every build. A dependency-free `postinstall` script (`scripts/patch-react-dev-utils.js`) patches it to `fs.constants.F_OK` after each install; it is idempotent and a no-op once upstream is fixed.

## Verification

- `npm ci && npm run build` — clean production build (warnings pre-exist from the original codebase)
- `node --check functions/index.js` — functions syntax
- Email templates were rendered from both the original and refactored code with stubbed Firebase modules and diffed: OTP email byte-identical, redemption email identical except trailing whitespace on blank lines
