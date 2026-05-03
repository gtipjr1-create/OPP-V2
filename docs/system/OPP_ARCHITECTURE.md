# OPP Architecture

## Current Stack
- Frontend: React 19 + Vite 7
- Language: JavaScript (JSX)
- Data/Auth: Supabase (`@supabase/supabase-js`)
- Lint/Test/Build: ESLint, Vitest, Vite build

## App Structure
- Entry: `src/main.jsx` -> `src/App.jsx`
- Auth gate + recovery flow: `src/App.jsx`
- Main app orchestration and screen state: `src/OPPApp.jsx`
- Primary screen modules:
  - `src/Today.jsx`
  - `src/Domains.jsx`
  - `src/Priorities.jsx`
  - `src/Standards.jsx`
  - `src/Settings.jsx`
  - `src/ArchivedSessions.jsx`
- Shared shell/navigation: `src/MobileShell.jsx`, `src/BottomNav.jsx`
- Data access modules: `src/data/*`
- Utility modules: `src/lib/*`

## Major Routes / Screens
This app currently uses a single-page screen-state model rather than React Router routes.
- Auth states:
  - Login (`LoginPage`)
  - Reset password (`ResetPasswordPage`)
  - Authenticated app (`OPPApp`)
- In-app screens managed by `screen` state in `OPPApp`:
  - Today / Command Desk (default)
  - Domains
  - Priorities (mobile nav label: Focus)
  - Standards
  - Settings
  - Archived sessions

## Data / Storage Approach
- Supabase is the backing store for auth + product data.
- Supabase client initialized in `src/lib/supabase.js` via:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- App startup loads current user/profile and then loads domains, priorities, standards, today tasks, and weekly anchors.
- Domain defaults are seeded if needed.

## Current Boundaries
- OPP is in a parked state with a stable v1 baseline.
- Current baseline centers on conceptual clarity across:
  - Today
  - Domains
  - Priorities/Focus
  - Standards
  - Weekly Anchors / This Week
- Documentation is the source of truth for intent and freeze rules.

## Do Not Refactor Casually
- Screen role boundaries and semantics (Today vs Priorities vs Domains vs Standards)
- Mobile shell behavior (fixed chrome + bounded middle scroll)
- Vocabulary locks (Active/Steady, Day Item vs Commitment)
- Data model assumptions in `src/data/*` without explicit migration planning
- Supabase/auth boot flow in `src/App.jsx` and `src/OPPApp.jsx`
