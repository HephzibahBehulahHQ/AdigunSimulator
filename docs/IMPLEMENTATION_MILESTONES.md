# AdigunSimulator implementation milestones

This tracker records evidence-backed progress against the product requirements. A milestone is complete only when its criteria pass on the reviewed branch; a green unit-test suite alone does not establish browser acceptance, electrical validation, or production readiness.

| Milestone | Verifiable completion criteria | Current state |
| --- | --- | --- |
| 1. Product foundation and project safety | Local-first project format, save/import/export/recovery, responsive workspace, four interface locales, and disclosed scope limits pass automated checks and representative browser workflows. | In progress. Automated and localization contracts exist; representative browser/accessibility acceptance remains outstanding. |
| 2. Circuit editing and synchronized views | Breadboard, schematic, and PCB share project identity and nets; supported component placement/wiring edits synchronize across views; invalid and unsupported mappings are surfaced. | In progress. Shared identity/net model is implemented; broader edit synchronization and browser acceptance remain open. |
| 3. Bounded simulation and instruments | Each advertised model has an explicit model boundary, reproducible examples, numerical tests, cancellation/resource limits, and independent engineering review before release. | In progress. Multiple bounded analyses are tested; general SPICE, broad mixed-signal behavior, and independent review remain unavailable. |
| 4. PCB routing and fabrication preview | Supported layer/endpoint rules, net/clearance/keep-out checks, export integrity, and documented limitations are tested; production use additionally requires independent electrical and manufacturing review. | Implementation advanced; release pending. Nine existing PCB layouts were repaired after a new copper audit found shorts/clearance failures missed by the old checks. Stored plated vias now support F.Cu/B.Cu continuity and export. Local suite: 380/380. See the copper repair evidence below; no standards-complete DRC or manufacturing approval is claimed. |
| 5. Real component library | Reach 1,000 parts counted only after authoritative datasheet/checksum, exact MPN/package/lifecycle, audited pin/pad mapping, model/licence status, and named dated review are present. Taxonomy types and candidates are reported separately. | In progress. The ledger has 565 taxonomy types, 15 candidates, and 0 verified parts; target completion is 1,000 verified parts. |
| 6. Ready-made project catalogue | Each of the 200 projects has a native project, stable test ID, automated acceptance result, engine/model/library evidence, BOM where applicable, and proportionate safety note. | In progress. Catalogue coverage exists; completion requires per-project evidence under the release gate, not count alone. |
| 7. Adigun BOT and optional accounts | Local deterministic help stays grounded in checked-in project/library data; any external AI requires separate approval. Authentication remains optional until identity, privacy, retention, incident, deployment, and budget decisions are approved. | Local BOT capability exists. External AI and account/cloud features are gated on product-owner decisions. |
| 8. Release quality and production | Automated checks and representative browser, responsive, keyboard, accessibility, privacy/security, independent electrical, rollback, monitoring, and deployment approvals pass. Merge through the normal protected PR path; verify the Pages commit and live release. | Blocked for this branch. CI is green, but PR #505 remains draft and independent electrical/release approvals are not evidenced. No deployment is claimed. |

## Current branch verification

- Branch: `codex/rl-transient-acceptance`.
- Last verified implementation head: `e94b3e5573d5f72b54c4c47bec12f10a10390313` (copper integrity and layout repair).
- Required automated checks at that head: 380 tests passed; syntax check, library validation, and `git diff --check` passed; GitHub Actions run #1255 passed. Local and remote branch identities were rechecked on 2026-11-09.
- Deployment: not performed. The checked-in deployment runbook requires a non-draft review path, current-head checks, independent electrical review, and approved release safeguards before merge/deployment.

Update this tracker when a milestone's evidence changes. Do not count candidates as verified parts, planned examples as released projects, or an illustrative PCB export as manufacturing approval.

## Workspace startup and Run recovery — 2026-11-03

- The previous Python preview served `.mjs` as `text/plain` on this Windows machine. The new `npm run dev` server uses explicit JavaScript MIME types and a fixed simulator root. HTTP regression tests traverse the startup and worker import graph and cover JSON, HEAD, asset types, private paths, malformed URLs and rejected writes.
- Browser execution then exposed three single-element selectors incorrectly used as collections in localization and diagnostics. Those prevented initial rendering; all three now select collections.
- The Run completion handler also formatted every unrecognized result as a resistor-network result, throwing on the default STM32 example. That formatter now applies only to its declared result kind.
- Browser checks now show 276 starter entries, populated canvas, the current-year footer, working English/German/Yoruba/Pidgin switching, STM32 PWM results (1.00 kHz, 49.9%, 3.94 mA on-current), and working Errors/Output tabs. No new console errors appeared in the corrected Run/diagnostics checks. These are bounded startup checks, not full browser acceptance.
- Six new automated tests cover HTTP delivery and execution of the actual localization, diagnostic-tab and result-completion functions. The local suite passed 368/368, with syntax, library validation and whitespace checks passing. Full release, manufacturing and independent electrical review remain open.

## Copper integrity and layout repair — 2026-11-09

| Delivery item | Completion criterion | Evidence |
| --- | --- | --- |
| Copper audit | Reject crossings, NC-pad collisions, class-spacing violations and disconnected islands before producing fabrication files. | Automated geometry/export regression tests pass. |
| Example repairs | Examples 122–129 and 134 pass strengthened DRC with unchanged native nets and component pads. | All nine pass. Example 125 now declares two layers and ten explicit plated vias; other stacks are unchanged. Export snapshots updated. |
| Stored via integration | Render/select via endpoints; preserve layer continuity; include copper/drills and exclude vias from BOM. | Unit tests pass; browser Enter selection on a B.Cu via reports the correct endpoint with no console error. Via creation/movement UI remains future work. |
| Preview proportions | Tall inspector contents must not vertically stretch the PCB SVG. | Desktop canvas measured about 631 × 278 px instead of 631 × 1696 px; board proportions restored. Full responsive/visual-reference acceptance remains open. |
| Checks and synchronization | Full suite, library validation, syntax and whitespace checks pass; local and remote commit identities agree. | Local suite 380/380; library and syntax checks pass. Push/current-head CI verification pending at this record's creation. |
| Production release | Current-head CI, independent review and the documented protected release path pass; deployment commit and live page are verified. | Not performed. PR #505 is draft and has no reviews; production release prerequisites remain unmet. |

The previous PCB milestone evidence did not cover stored trace crossings. Its apparent clearance success was incomplete; this audit adds that missing gate and repairs the affected fixtures. See `PCB_COPPER_RULES.md` for supported geometry and remaining limits. The temporary offline fixture-routing helper and verification logs live outside the product repository and are excluded from delivery. No general autorouter is advertised.

## Requirements integration and release checklist — 2026-11-09

The eight product milestones above remain the product-wide tracker; none is declared fully accepted. The five items below track this delivery request only, not a percentage of the entire simulator specification.

| Delivery item | Completion criterion | Evidence at preparation |
| --- | --- | --- |
| Repository audit | Confirm official remote, branch, local changes, diff and existing CI before edits. | Clean branch at `e94b3e5`; matching GitHub head; CI #1255 passed; no uncommitted files to exclude. |
| Requirements integration | Preserve the owner's latest specification, instructions and three visual targets without rewriting history or source text. | Merge `main` at `d5e2ae5e7ea2c6f8b0d1fe590e1533174e462f66`; `Plangoals.md`, `AGENTS.md` and target PNGs retain their upstream bytes. No application code changes in this integration. |
| Required validation | Library validation, full tests and syntax checks pass for the integrated tree. | Local suite 380/380; library and syntax checks pass. Edited-document whitespace checks pass; the owner's specification retains its original Markdown line breaks and trailing blank line. Matching CI evidence is recorded on PR #505. |
| GitHub synchronization | A normal two-parent merge commit is pushed; local and remote heads match; current-head CI passes. | Final commit and CI evidence are recorded on PR #505 after synchronization. |
| Production release | Independent electrical/release review and representative browser acceptance pass; normal PR merge and Pages deployment succeed for the merged commit. | Pending. PR #505 remains draft with no reviews. Latest Pages deployment is still `3e940fe1ba2b8882a25ebd149477db5604a31bc9`; its recorded status is success and the live URL returns HTTP 200. These checks do not establish deployment of this branch. |

Finish-time estimates for the full product and this release remain undetermined while independent review and the outstanding product acceptance work are unresolved. Do not promote another implementation milestone to production or bypass these gates merely because automated checks pass.

Excluded from this integration: the temporary local QA log, stored outside the repository. The five files imported from `main` are byte-identical to their upstream versions; no caches, credentials or unrelated project files are included.

## Responsive workspace acceptance fixes — 2026-11-09

- Fixed toolbar overflow, narrow inspector fields, inaccessible mobile library content and clipped application menus. Compact view/tool controls retain translated names; menu Escape restores focus.
- Moved capability/mapping notices above the drawing and removed the incorrect CSS-generated "unrouted" PCB caption. Prevented delayed starter analysis from replacing a newer user choice or project state.
- Browser evidence: 60 three-view shell cases, 24 mobile menu cases, 12 expanded-search cases and 20 library bounds cases passed across four locales. Keyboard disclosure/via routing, guest tooltip and default viewport checks passed without captured console errors. See `RESPONSIVE_ACCEPTANCE.md` for exact scope, reproduction and limitations.
- Local checks: 384/384 tests, syntax and library validation passed. The first full run found an obsolete caption assertion; its corrected disclosure contract and the subsequent full suite passed. Final pushed commit and matching CI are recorded on PR #505.
- Product milestones 1 and 8 remain incomplete. Broader workflows, touch/accessibility, visual-reference acceptance and independent electrical/release review remain required. Production promotion stays gated; this work does not mark the complete product or release checklist as finished.

## Shared camera and edit-history checkpoint — 2026-11-09

| Category / checkpoint | Completion criterion | Evidence |
| --- | --- | --- |
| Workspace camera | Scale/pan all geometry together; keep coordinate conversion reversible and offer a bounded Fit reset. | Six three-view/viewport zoom cases, pointer pan and eight localized Fit checks passed. |
| Editor integrity | Keep schematic terminals aligned and preserve native schema, physical pads, nets and history across zoomed edits. | Schematic alignment and drag/Undo/Redo passed; PCB keyboard/pointer edits and native export parsing passed. |
| Routing interaction | Empty board space accepts a zoomed waypoint and Escape discards its draft. | B.Cu via-start, center waypoint and cancellation passed; automated snap/bounds checks passed. |
| Required checks and synchronization | Full suite, syntax/library checks and reviewed staging pass; pushed branch matches local with successful current-head CI. | Local 393/393 tests, syntax and library validation passed. Final commit/equality/CI evidence is recorded on PR #505 after push. |
| Production promotion | Required independent reviews, protected merge and exact-commit Pages/browser verification pass. | Not performed: draft PR #505 has no reviews; release prerequisites remain unmet. |

See `CANVAS_CAMERA_ACCEPTANCE.md` for measured results, reproducible checks, exclusions and remaining scope. The product-wide milestones remain open; the delivery checkpoint remains four of five only after matching-head synchronization/CI. These changes do not establish full visual, touch, electrical or manufacturing acceptance.
