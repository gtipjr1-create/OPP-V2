# OPP - Active Work

## Current Phase
v1 refinement (stable baseline achieved).

## Phase Objective
Strengthen conceptual precision and screen-role coherence so OPP feels cleaner, sharper, and more governed.

## Core Screen Truths
- Today: The command surface for re-entry and immediate orientation, using day items for day-level order.
- Domains: The structural layer of life allocation and emphasis.
- Priorities: The management layer for selected commitments across horizons.
- Standards: The governing layer for rules and non-negotiables.

## Locked Vocabulary
- Active: Deliberate current push.
- Steady: Maintained without current push.
- Session: Current operating window of re-entry, orientation, and daily control.
- Priority: Selected focus object inside the commitment layer.
- Commitment: Deliberately chosen item that deserves active attention now.
- Day Item: Day-level capture point for order and completion in the current day.
- Standard: Rule of operation independent of mood, energy, or circumstances.
- Horizon: Today, This Week, Ongoing, Season.

## Distinction Lock
- Day items support daily order.
- Commitments support active focus.
- Today holds day items.
- Priorities hold commitments.

## Execution Priorities
1. Lock screen roles in docs and UI labels.
2. Resolve Today vs Priorities overlap.
3. Clarify behavioral meaning of Active/Steady/Horizon/Session.
4. Strengthen Standards as a governing pillar.
5. Remove duplication that does not serve orientation or management.

## Progress Snapshot
- Priority 1 complete: roles locked in docs and reflected in UI copy.
- Priority 2 complete: Today now behaves as orientation; Priorities as management.
- Priority 3 complete (v1 depth): horizon ordering and active/steady/session semantics now influence presentation.
- Priority 4 complete (v1 depth): Standards now reads as governing rules, not lightweight notes.
- Priority 5 complete (v1 depth): repeated information trimmed where it lacked clear purpose.
- UI rhythm pass complete: bottom nav strengthened and top-stack spacing aligned across all core screens.
- Mobile shell pass complete: fixed header/nav, single middle scroll surface, and safe-area spacing unified across core screens.
- Today compression pass complete: top stack and orientation panels tightened for faster access to command surfaces above the fold.
- Nav refinement complete: mobile label changed from Priorities to Focus for cleaner width and clarity.
- Icon quality pass complete: sharp high-resolution source restored with subtle pulse motion.
- Mobile token pass complete: spacing/type tokens introduced for cross-screen consistency.
- Today interaction polish complete: adaptive Domains preview behavior, earlier quick-add placement, and refined day-item drag/reorder handling.
- Shell scroll-boundary lock complete: middle viewport is now constrained between header and nav to prevent text bleed behind chrome.
- Domains inline-focus pass complete: active-domain focus text can now be edited inline while status changes remain in modal edit flow.
- Focus empty-state polish complete: Priorities messaging and capacity badge tone adjusted for calmer guidance.
- Keyboard-sheet pass complete: Domains/Priorities sheets now render in portal overlay with viewport-aware sizing and improved keyboard alignment on iPhone.
- Micro rhythm pass complete: Domains and Focus spacing tightened for cleaner mobile scan without behavior changes.
- Header alignment pass complete: Today date stack moved higher and top breathing room standardized under divider lines on Domains/Focus/Standards.
- Settings entry polish complete: Today uses a standalone cog icon trigger and Settings header clipping has been corrected.
- Standards depth pass (v1) complete: live rule-quality guidance added during standard draft/edit to improve operational clarity.
- Standards depth pass (v2/v3) complete: category model/filtering and lightweight review cadence are now integrated with persistence wiring.
- Today intelligence pass (v1) complete: carry-forward cues and focus-signal indicators now improve orientation without increasing noise.

## Current Focus
- Preserve stable baseline while collecting any final device-specific edge cases.
- Preserve model-language consistency as future changes are introduced.
- Keep token-driven consistency across core screens as refinements continue.
- Continue polishing touch interactions where inline edits and drag gestures can overlap.
- Preserve stable sheet ergonomics during keyboard-open edits across all mobile form flows.
- Preserve compact vertical cadence in Domains/Focus while keeping touch targets comfortable.
- Keep top-divider spacing balanced across core screens while maintaining quick-access above-the-fold density.
- Keep utility-entry iconography minimal, clear, and consistent with app chrome.
- Continue strengthening Standards as a behavior-shaping layer, not just a storage list.
- Keep Standards filters and review actions lightweight so governance remains actionable at a glance.
- Preserve calm command-surface behavior while surfacing carry-forward and focus signals where they matter.

## Stability Checklist (Current)
- Build passes on current branch.
- Core screens share one mobile shell behavior (fixed header/nav, bounded middle scroll).
- No text bleed behind top or bottom chrome during list scroll.
- Today quick-add input no longer triggers iOS typing shift.
- Day-item long-press reorder is functional with edge auto-scroll and improved hold behavior.
- Bottom-nav readability and label compactness validated (`Focus`).
- Domains active-lane focus can be edited inline without changing status flow.
- Domains/Priorities bottom-sheet actions remain reachable while keyboard is open.

## Open Implementation Decisions
- Day-item lifecycle policy is locked: carry-forward-until-complete.
- Settings access model is still open: current direct entry from Today vs full top-level parity.

## In Scope Right Now
- Tighten language and semantics.
- Improve hierarchy between preview surfaces and management surfaces.
- Improve conceptual consistency across screens.
- Refine empty states to reinforce product meaning.

## Out of Scope Right Now
- New tabs or major feature expansion.
- Analytics-heavy additions.
- Extra navigation patterns.
- High-density control panels.
- Gamification or novelty layers.

## Decision Filter
Before shipping a change, confirm:
1. Does it sharpen meaning?
2. Does it reduce drift between layers?
3. Does it preserve calm, low-noise surfaces?
4. Does it make one screen more clearly itself?
5. Does it avoid feature breadth for its own sake?

