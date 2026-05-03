# AGENTS.md — OPP (Personal Command System)

## 1. Project Identity

OPP (Operating Personal Platform) is a **Personal Command Center** for disciplined living and focused building.

It is not:
- a generic productivity app
- a task manager clone
- a second Forge
- a feature-heavy system

It is:
- a **clarity system**
- a **decision surface**
- a **personal operating layer**

Core purpose:

> Help the user see clearly what matters, what to do, and how to operate — without noise.

---

## 2. Current Status (CRITICAL)

OPP is currently:

> **PARKED — NOT IN ACTIVE FEATURE DEVELOPMENT**

This is intentional.

Other projects (SelfTrainer Native, Forge, FitPulse) are leading.

### Implication for all agents:

- Do NOT expand the system
- Do NOT add new features
- Do NOT redesign the app
- Do NOT introduce new architecture layers

Allowed work:

- organization
- documentation
- clarity improvements
- structure alignment with other projects

---

## 3. Core Screens (v1 Scope)

These define the product. Do not drift beyond this without explicit instruction.

- Today / Command Desk
- Domains
- Priorities
- Standards
- Weekly Anchors (This Week)

These are enough for v1.

---

## 4. Product Philosophy

OPP is built on:

- clarity over volume
- signal over features
- structure over flexibility
- discipline over convenience

Avoid:

- feature stacking
- “nice to have” additions
- UI clutter
- over-automation

---

## 5. System Boundaries

### Do NOT:

- Merge Forge logic into OPP
- Add chat interfaces
- Add AI layers
- Build complex automation systems
- Add notifications systems
- Expand into habit tracker / CRM / planner hybrids

### Do NOT prematurely:

- introduce Supabase persistence layers
- design complex schemas
- build backend-heavy systems

---

## 6. Allowed Work While Parked

Agents may:

- organize file structure
- improve documentation clarity
- align naming conventions
- create missing system docs
- prepare future implementation plans (non-executed)
- clean up obvious inconsistencies

Agents may NOT:

- implement new features
- refactor core architecture
- redesign UI systems

---

## 7. Resume Conditions

OPP can only re-enter active development when:

- SelfTrainer Native is stable
- Forge behavior is reliable
- FitPulse cadence is protected
- user explicitly signals OPP build phase

Until then:

> OPP remains in a **prepared, ready state**

---

## 8. Decision Rule

When uncertain, default to:

> “Preserve clarity. Do not expand.”

---

## 9. Reference Documents

Agents should prioritize reading:

- docs/system/OPP_CONTEXT.md
- docs/system/OPP_PRODUCT_SPEC.md
- docs/system/OPP_ARCHITECTURE.md
- docs/system/OPP_FREEZE_BOUNDARY.md
- docs/active/ACTIVE_WORKING.md
- docs/active/NEXT_SESSION.md

---

## 10. Tone of Work

All contributions should feel:

- calm
- structured
- intentional
- minimal
- high signal

No rushed implementations.
No experimental clutter.
No speculative features.

---

## 11. One-Line Lock

> OPP is a personal command system. It is not being expanded right now — it is being preserved in a clean, ready state for future execution.

## Operator Skills

Use the local `.agents/skills` directory when relevant.

Recommended skill routing:

- `opp-structure-guardian`  
  Use for docs, folders, naming, project structure, README, AGENTS, CLAUDE, and parked-state organization.

- `opp-product-critic`  
  Use when evaluating whether an idea belongs in OPP or should be parked/rejected.

- `opp-session-handoff`  
  Use at the end of OPP sessions.

- `opp-implementation-brief`  
  Use only when explicitly asked to plan or implement OPP work.

Default rule:

> If the request is not explicitly implementation work, do not implement. Preserve OPP in a clean ready state.
