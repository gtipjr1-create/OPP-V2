# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite HMR)
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```

No test runner is configured yet.

## Architecture

React 19 + Vite app — a mobile-first task session manager UI.

**Entry point:** `src/main.jsx` renders `<ActiveSession />` directly (no router, no global state library).

**`src/ActiveSession.jsx`** is the entire application in one file:
- All styles are inline JS objects (no CSS modules, no Tailwind)
- All state lives in the top-level `ActiveSession` component via `useState`/`useRef`/`useCallback`
- Sub-components (`CheckIcon`, `PriorityBadge`, `LockToggle`, `SettingsLayer`, `RenameSheet`, `EditSheet`, `ConfirmDeleteSheet`, `SwipeRow`) are defined in the same file
- Task data is hardcoded in `tasksData` (no backend/API)

**Key state:**
- `taskList` — source of truth for all tasks
- `locked` — prevents edits/adds when true
- `dragId` / `overIndex` — pointer-based drag-to-reorder (activates after 280ms hold)
- `editTask`, `confirmDeleteId`, `renameOpen`, `settingsOpen` — controls which overlay/sheet is visible

**Completion metrics:** `completionPct` (raw) and `weightedPct` (by `PRIORITY_WEIGHT: HIGH=3, NORMAL=2, LOW=1`) both drive color via `getPctColor` (red → orange → green).

**Gesture system:** `SwipeRow` handles left-swipe-to-delete via touch events. The parent container handles pointer events for drag-to-reorder. These must not conflict — swipe only activates when `isDragging` is false.

**Fonts:** `DM Sans`, `DM Serif Display`, `IBM Plex Mono` — loaded from Google Fonts via an inline `<style>` tag inside the component.
