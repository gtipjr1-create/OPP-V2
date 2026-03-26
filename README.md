# OPP v1

OPP is a personal operating system focused on clarity, structure, and deliberate execution.

This phase is a refinement phase, not an expansion phase.

## Product Goal

Make OPP:
- cleaner
- sharper
- more accurate
- more internally coherent

Not more feature-heavy.

## Screen Truths

Each primary screen has one governing role:

- Today: The command surface for re-entering the system and seeing what governs attention right now.
- Domains: The structural view of life areas and their current level of emphasis.
- Priorities: The management layer for what is actively in focus across time horizons.
- Standards: The governing layer for the rules and non-negotiables that define operation.

If a screen drifts outside its sentence, it is product drift.

## Core Vocabulary

- Active: A domain or item receiving deliberate attention and advancement now.
- Steady: A domain being maintained without current push.
- Session: The current operating window of focus and orientation.
- Priority: A current focus item assigned to a domain and horizon.
- Standard: A rule of operation that governs behavior regardless of mood.
- Horizon: The time-frame of priority relevance (Today, This Week, Ongoing, Season).

## v1 Discipline

- Today is orientation and re-entry, not full management.
- Priorities is where focus is structured and edited.
- Domains represents life structure, not simple tags.
- Standards should read like operational rules, not lightweight notes.
- Reduce duplication unless it serves preview, context, or state.
- Keep visual restraint and low-noise surfaces.

## Behavioral Semantics

- Horizons influence surfacing, not just labeling:
- Today-facing priorities should surface first in Today.
- This Week commitments should remain highly visible in orientation previews.
- Ongoing and Season commitments should remain present with lower urgency.
- Active domains should be treated as push lanes; Steady domains as maintenance lanes.
- Session state should reflect current operating readiness, not just raw item count.

## Development

```bash
npm run dev
npm run lint
npm run build
```

## Current v1 Status

Recent refinement work completed:
- locked screen-role model and glossary vocabulary
- clarified Today as orientation/re-entry and Priorities as management
- made horizon and active/steady semantics behaviorally visible
- strengthened Standards as a governing layer
- refined Domains as structural life lanes
- added Settings glossary (collapsed by default, expandable groups)
- completed final UI polish pass (type scale, spacing rhythm, icon restoration, nav typography)
