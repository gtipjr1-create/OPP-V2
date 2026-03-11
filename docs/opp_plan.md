OPP — MAIN SCREEN REFINEMENT PLAN
Purpose

This block defines the next implementation phases for the OPP main screen.

The goal is to move from promising prototype styling into a more disciplined, semantically correct, and system-cohesive interface.

The main screen should feel:

calm

premium

structured

strict

operational

It should avoid visual drift, accidental color usage, and unclear state language.

Phase 1 — Visual System Alignment
Objective

Establish a strict semantic color system and remove decorative drift.

Core Color Rules

Blue = active / interactive / live / selected

Green = complete / resolved / confirmed success

Red = urgent / exception / high priority

Neutral = structure / inactive / supporting UI / most interface surfaces

Implementation Targets

remove yellow and lime entirely

audit all current color use against semantic meaning

ensure most of the screen lives in neutral tones

reserve blue for actions, live states, and selected controls

reserve green only for true completion states

keep red rare and meaningful

Expected Result

The screen feels more controlled, more disciplined, and more like a real operating system instead of a styled dashboard.

Phase 2 — Hero and State Logic Cleanup
Objective

Make the top section semantically trustworthy and visually coherent.

Hero Element Rules

OPP icon = blue

date = off-white

metadata line = muted neutral

Active Session = neutral system/context label

In Progress = blue live-state label

Complete = green resolved-state label only when the session is truly complete

Hero Metric Rules

Partial progress metrics should not use green.

Use:

off-white or soft blue for partial/live progress

green only when completion is fully achieved

Current Direction

For states like:

75% Completion

67% Weighted

use off-white or soft blue.

Only transition to green when the associated state is fully completed.

Expected Result

The hero section communicates clear meaning without state contradiction.

Phase 3 — Add Row Refinement
Objective

Refine the task creation row so it feels integrated, restrained, and productized.

Structural Rule

The add interaction should remain at the top of the Work Stack.

It should read as:

enter task

confirm add

not:

input here

separate loud action block there

Add Button Direction

keep the + on the input row

reduce overall size slightly

reduce fill intensity slightly

integrate more tightly with the input field

align height, spacing, and visual weight more carefully

Design Intent

The + should feel like compact utility, not a primary hero action.

Expected Result

The add row reads as one composed system instead of two loosely adjacent controls.

Phase 4 — Work Stack Hierarchy Polish
Objective

Strengthen scanability, clarity, and operational hierarchy in the main card.

Work Stack Rules

card surface = dark neutral

section label = muted neutral

input field = dark neutral with soft border

selected filter = blue

inactive filters = neutral

completed tasks = subdued neutral

unfinished task = off-white / active

HIGH priority chip = red

Priority Logic

red should only appear when urgency or exception is truly intended

low-priority and normal states should not introduce extra decorative color

Visual Hierarchy Goal

The list should make it easy to distinguish:

what is done

what remains active

what needs immediate attention

Expected Result

The Work Stack becomes the true operational center of the screen.

Phase 5 — Overflow Menu Architecture
Objective

Move secondary and non-immediate actions off the front layer into a more disciplined utility structure.

Principle

Main screen = execution
Overflow menu = utility and secondary controls

Proposed Menu Sections
Session

Duplicate

Export

Archive / Close Session

Rename if needed

Personal / System

Themes

Profile

Preferences / Settings

View / Interface

Display options

Layout options

future visual controls only if truly needed

Placement Rule

Settings and utility actions should not compete with active-session content.

Expected Result

The main screen stays focused while still preserving access to deeper actions and system controls.







OPP — UPDATED NEXT PHASES
Phase 6 — Secondary Legibility Pass
Objective

Improve readability of supporting UI without breaking the restrained dark-system feel.

Focus

Slightly raise contrast for:

hero metadata line

WORK STACK label

task time text

inactive chips

row dividers

subdued completed-task details

Rule

Do not brighten the whole screen.
Only lift elements that are important but currently too easy to lose.

Outcome

The interface remains calm and strict, but easier to parse.

Phase 7 — Work Stack Edit Mode Refinement
Objective

Formalize Unlocked / Locked as a real card-level interaction toggle.

Product meaning

Unlocked = tasks are editable

Locked = tasks are not editable

Focus

keep the toggle inside the Work Stack controls area

make it feel like an actual interaction-state control, not just a label

ensure blue is used for the active editable state

ensure locked state is neutral and clearly non-editable

define what actions are allowed in each state

Expected behavior

When Unlocked:

add / edit / reorder / modify tasks allowed

When Locked:

execution-only view

editing disabled

Outcome

The Work Stack gains a clear operating mode and stronger product logic.

Phase 8 — Work Stack Height Behavior
Objective

Lock the card sizing behavior so the layout feels intentional at every workload level.

Height model

content-sized by default

expands naturally as workload increases

preserves consistent padding and spacing as it grows

only introduces internal scroll at higher task counts if needed

Rule

Avoid empty lower space without purpose.

Behavior by workload
Light day

compact card

no unnecessary dead space

Medium day

card expands naturally with tasks

Heavy day

card continues to grow until a sensible threshold

internal scroll only if needed later

Outcome

The Work Stack feels responsive, structured, and aligned with OPP’s disciplined identity.

Phase 9 — Footer Action Refinement
Objective

Keep + New Session secondary, but make it feel intentionally placed and readable.

Focus

preserve its secondary role

improve spacing around it

define a clearer footer zone

slightly improve readability

avoid making it feel like a primary CTA

Rule

It should read as a footer utility action, not a main screen action.

Outcome

The lower edge of the screen feels resolved instead of leftover.