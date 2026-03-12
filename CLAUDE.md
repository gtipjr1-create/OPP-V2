# CLAUDE.md

## Project context imports
@docs/MASTER_CONTEXT.md
@docs/ACTIVE_WORK.md
@docs/ARCHIVE_IDEAS.md

This file provides guidance to Claude Code when working in this repository.

---

## Read This First

The imported docs in `docs/` are the source of truth for:
- product identity
- current execution
- deferred ideas

Before making recommendations or editing code, align with:
- `docs/MASTER_CONTEXT.md` — stable product identity, philosophy, and long-term guardrails
- `docs/ACTIVE_WORK.md` — current focus, current phase, and what is actively being shaped
- `docs/ARCHIVE_IDEAS.md` — preserved ideas and deferred directions; do not treat these as active scope unless explicitly asked

Code decisions should align with these docs.

---

## Product Identity

OPP is a personal operating system built to reduce noise and help me live, build, train, and think with clarity, discipline, and control.

It is not:
- a generic productivity app
- a gamified habit tracker
- a social product
- a cluttered life dashboard
- a feature-heavy experimentation playground

It is:
- a structured personal operating framework
- a calm control system
- a low-noise command layer for life organization
- a disciplined environment for clarity and self-direction

---

## Working Style

This project should be developed with a slow, deliberate, quality-first approach.

Priorities:
- clarity over cleverness
- structure over speed
- stability over unnecessary rewrites
- signal over clutter
- strong hierarchy over excessive options
- maintainability over novelty

Do not:
- overcomplicate the architecture
- introduce trendy patterns without clear value
- add speculative features just because they sound useful
- create visual noise
- drift from the product identity in `docs/MASTER_CONTEXT.md`

---

## Execution Rules

When making changes:

1. Align with the docs first.
2. Respect current active scope in `docs/ACTIVE_WORK.md`.
3. Do not pull deferred ideas from `docs/ARCHIVE_IDEAS.md` into implementation unless explicitly requested.
4. Prefer focused, understandable edits over broad refactors.
5. Preserve a calm, structured, premium feel in both code and UI.
6. Keep the system cognitively light.
7. Avoid duplication in logic, views, or state ownership.
8. If a change increases complexity, it should provide meaningful clarity or capability in return.

When suggesting features or UI:
- prioritize usefulness
- reduce noise
- avoid dashboard bloat
- avoid over-tracking
- avoid productivity theater

---

## Documentation Role

Use the `docs/` folder as the source of truth for direction:

- `MASTER_CONTEXT.md` = what the product is
- `ACTIVE_WORK.md` = what matters now
- `ARCHIVE_IDEAS.md` = what is preserved but inactive

If code and docs conflict, prefer the docs unless they have been explicitly updated.

---

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview