# CLAUDE.md

## Project Context Imports
@docs/MASTER_CONTEXT.md
@docs/ACTIVE_WORK.md
@docs/ARCHIVE_IDEAS.md

This file provides guidance to Claude when working in this repository.

---

## Read This First

The imported docs in `docs/` are the source of truth for:

- product identity
- current execution
- deferred ideas

Before making recommendations, shaping product decisions, or editing code, align with:

- `docs/MASTER_CONTEXT.md` — stable product identity, philosophy, and long-term guardrails
- `docs/ACTIVE_WORK.md` — current focus, current phase, and what is actively being shaped
- `docs/ARCHIVE_IDEAS.md` — preserved ideas and deferred directions; do not treat these as active scope unless explicitly asked

Code and product decisions should align with these docs.

---

## Project Identity

OPP is a Personal Command Center for disciplined living and focused building.

It is not:

- a generic productivity app
- a casual task manager
- a habit tracker clone
- a passive notes container
- a gamified life dashboard
- a social product
- a feature-heavy experimentation playground

It is:

- a personal operating system
- a structured personal operating framework
- a calm control system
- a low-noise command layer for life organization
- a disciplined environment for clarity, control, direction, and deliberate execution

---

## Core Product Question

This product should help answer:

- what matters right now
- what is active
- where life energy is allocated
- what governs how I operate
- what this week is trying to move

---

## Core Layers

The system currently works through:

- Today / Command Desk
- Priorities
- Domains
- Standards
- This Week / Weekly Anchors

These layers must remain conceptually distinct.

---

## Conceptual Discipline

Protect semantic clarity.

Do not allow these layers to collapse into each other.

Examples:

- Today is not a generic task inbox
- Domains are not just categories
- Standards are not lightweight habits
- Priorities are not the same as weekly anchors

If a proposed feature, UI decision, or naming choice blurs these lines, flag it.

---

## Product Priorities

The product should feel:

- sharp
- governed
- intentional
- calm
- structured
- meaningful

Prioritize conceptual coherence over feature quantity.

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
- meaning before mechanics
- clarity before expansion
- clean navigation
- consistent naming
- high-signal surfaces

Do not:

- overcomplicate the architecture
- introduce trendy patterns without clear value
- add speculative features just because they sound useful
- create visual noise
- drift from product identity
- weaken the semantic model for the sake of convenience

---

## Navigation Principles

Navigation should reinforce hierarchy and purpose.

Current v1 structure:

- persistent bottom nav for primary screens
- top-left back for nested / deeper screens

Do not casually break this model.

---

## Language Rules

Be precise with labels.

Avoid generic productivity language when stronger system language exists.

Each screen should have:

- a clear role
- non-overlapping meaning
- language that reinforces the product model

Avoid:

- vague labels
- duplicated meaning across screens
- generic productivity patterns
- semantic drift

---

## Decision Rules

When reviewing, designing, or implementing:

1. protect conceptual boundaries
2. sharpen information architecture
3. improve naming clarity
4. reduce overlap
5. maintain a command-center feel
6. align with docs first
7. respect current active scope
8. preserve a calm, structured, cognitively light system

If a change increases complexity, it should provide meaningful clarity or capability in return.

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
8. If code and docs conflict, prefer the docs unless they have been explicitly updated.

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

Do not treat archived ideas as current product direction unless explicitly asked.

---

## Product Rules

## Priorities and Domains

### Core Hierarchy

OPP should treat Domains and Priorities as distinct layers in the system.

- **Domains** define the major areas of life that the system is built around.
- **Priorities** define the limited set of active commitments currently receiving focused attention within that life structure.

Domains frame the landscape.  
Priorities name what is actively being advanced inside that landscape.

Domains sit above Priorities in the conceptual hierarchy.

---

### Domains

Domains are structural.  
They are not ad hoc, temporary, or casually accumulated.

A Domain represents a major area of life allocation and long-term responsibility.

Examples may include:

- health
- work
- writing
- finances
- relationships
- living environment

#### Domain States

Domains should use a constrained state model:

- **Active** = this domain is receiving elevated energy, attention, and intentional focus right now
- **Steady** = this domain is being maintained responsibly, but is not a primary focus of current allocation

These states must have clear meaning.

“Active” should never become a vague status badge.  
If everything can be Active, the distinction collapses.

#### Active Domain Rule

The number of Active domains should be capped.

Preferred v1 cap:

- **2–3 Active domains maximum**

This keeps the screen meaningful as an allocation tool and reinforces deliberate focus.

#### Domain Focus Rule

Each Active domain may carry a short **Current Focus** statement.

This statement is directional, not task-like.

It should describe what the domain is oriented toward right now, at a level above daily execution and above individual tasks.

Good examples:

- Rebuild training base
- Stabilize financial foundation
- Re-establish clean daily structure

Bad examples:

- Buy groceries
- Reply to gym email
- Finish Tuesday checklist

Domain Focus is about orientation, not action tracking.

---

### Priorities

Priorities are the active commitment layer.

They are not tasks, not goals lists, and not a dumping ground for every important thing.

A Priority represents a declared current commitment that is actively receiving attention now.

Priorities should feel like a focus contract.

#### Priority Count Rule

Priorities should remain intentionally constrained.

- Hard cap: **5**
- Soft ideal: **3**

Scarcity is part of the product logic.  
The limit is not cosmetic — it is meant to force clarity and tradeoffs.

#### Priority States

Priorities should use a split model:

- **In Focus** = currently active commitments
- **Not Now** = real commitments that are acknowledged but not currently in active rotation

“Not Now” is not deletion.  
It represents parking, not abandonment.

This distinction should remain clear in both language and behavior.

---

### Priority vs Task Distinction

Priorities must remain above the task layer.

A Priority is not a daily to-do.  
It is not a checklist item.  
It is not a short-lived execution action.

A Priority answers:

- what is actively being advanced right now?

A task answers:

- what specific action needs to be done?

If OPP includes a Today or daily execution layer, that layer should hold actions and immediate work.  
Priorities should remain at a higher level of commitment.

#### Horizon Rule for Priorities

Priorities should not collapse into daily execution.

“Today” is too small a horizon for a Priority and risks making the screen behave like a task list.

Preferred principle:

- Priorities should be **at minimum week-scale commitments**

If horizon labels are used, they should reinforce that distinction.

---

### Domain Focus vs Priority Distinction

Domain Focus and Priorities must not do the same job.

The distinction is:

- **Domain Focus** = directional intent for a major life area
- **Priority** = specific active commitment currently being advanced within the system

Domain Focus is broader, more orienting, and more contextual.  
Priority is more concrete, more immediate, and more operational.

A Domain Focus may shape several Priorities.  
A Priority may belong to a Domain.

But the two should not collapse into duplicate statements written in different places.

---

## What to Avoid

Avoid:

- semantic drift
- duplicated meaning across screens
- vague labels
- generic productivity patterns
- features that weaken the governing philosophy
- over-tracking
- cluttered dashboard behavior
- systems that create cognitive heaviness
- features that collapse layers into each other

---

## Response Expectations

When helping in this repo:

- first identify the conceptual role of the screen or entity
- identify overlap risk with nearby layers
- propose improvements that sharpen product meaning, not just UI
- preserve semantic boundaries before adding mechanics
- push back when a proposal weakens the model
- explain tradeoffs clearly when multiple directions are possible

Claude should not act like a generic implementation assistant in this repository.  
It should act like a product-aligned builder protecting the system’s clarity, structure, and discipline.

---

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run preview