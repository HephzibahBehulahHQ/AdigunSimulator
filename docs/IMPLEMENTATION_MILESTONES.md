# AdigunSimulator implementation milestones

The three owner-reaffirmed interface targets are mandatory acceptance criteria; see `VISUAL_TARGET_ACCEPTANCE.md`. Their final rendered comparison remains open independently of incremental releases.

This tracker records evidence-backed progress against the product requirements. A milestone is complete only when its criteria pass on the reviewed branch; a green unit-test suite alone does not establish browser acceptance, electrical validation, or production readiness.

| Milestone | Verifiable completion criteria | Current state |
| --- | --- | --- |
| 1. Product foundation and project safety | Local-first project format, save/import/export, explicit reopen, clean session lifecycle, responsive workspace, four interface locales, and disclosed scope limits pass automated checks and representative browser workflows. | In progress. Automated and localization contracts exist; representative browser/accessibility acceptance remains outstanding. |
| 2. Circuit editing and synchronized views | Breadboard, schematic, and PCB share project identity and nets; supported component placement/wiring edits synchronize across views; invalid and unsupported mappings are surfaced. | In progress. Shared identity/net model is implemented; broader edit synchronization and browser acceptance remain open. |
| 3. Bounded simulation and instruments | Each advertised model has an explicit model boundary, reproducible examples, numerical tests, cancellation/resource limits, and independent engineering review before release. | In progress. Multiple bounded analyses are tested; general SPICE, broad mixed-signal behavior, and independent review remain unavailable. |
| 4. PCB routing and fabrication preview | Supported layer/endpoint rules, net/clearance/keep-out checks, export integrity, and documented limitations are tested; production use additionally requires independent electrical and manufacturing review. | In progress; release pending. Stored vias support inspector editing, two-layer routing/export, keyboard nudging and pointer dragging. Rectangular one/two-layer board setup, net-class editing, and board-wide trace/clearance rules are implemented and tested; full stackup/outline support, specialized package assets, and independent manufacturing review remain open. |
| 5. Real component library | Reach 1,000 parts counted only after authoritative datasheet/checksum, exact MPN/package/lifecycle, audited pin/pad mapping, model/licence status, and named dated review are present. Taxonomy types and candidates are reported separately. | In progress. The latest `npm run validate:library` reports 565 taxonomy types, 17 candidates, and 0 verified parts; target completion is 1,000 verified parts. |
| 6. Ready-made project catalogue | Each of the 200 projects has a native project, stable test ID, automated acceptance result, engine/model/library evidence, BOM where applicable, and proportionate safety note. | In progress. Catalogue coverage exists; completion requires per-project evidence under the release gate, not count alone. |
| 7. Adigun BOT and optional accounts | Local deterministic help stays grounded in checked-in project/library data; any external AI requires separate approval. Accounts and opt-in cloud saves need owner-approved scope plus accurate privacy, retention, deletion, incident, deployment, and budget handling. | On 2026-11-12 the owner approved optional email accounts and opt-in cloud saves, with guest projects remaining local. PR #568 and PR #569 are merged; production commit `d498597` is verified. The simulator origin is in the shared Supabase Auth redirect allowlist while preserving the existing default Site URL. Cloud saves use explicit per-project upload, owner-only RLS, bounded project/revision counts, and account deletion cascades. Broader browser, privacy, incident-response, and product acceptance remain open. |
| 8. Release quality and production | Automated checks and representative browser, responsive, keyboard, accessibility, privacy/security, independent electrical, rollback, monitoring, and deployment approvals pass. Merge through the normal protected PR path; verify the Pages commit and live release. | PR #569 passed exact-head CI and was merged; the production release marker reports `d498597`, and the cloud migration, RLS policies, table isolation, and security advisories were checked. Incremental releases continue through focused PRs. Full product acceptance remains open pending broader browser/accessibility coverage, independent electrical and release review, and remaining rollback/monitoring evidence. |

## Current branch and production verification — 2026-11-12 (updated after PR #567)

- PR #567 qualifies the application's exported ideal 10 mA current-source / 1 kΩ resistor deck with pinned native and WebAssembly ngspice builds. The CI harness appends `.op`; product export remains analysis-free.
- Exact-head application CI, native ngspice and WebAssembly ngspice all passed after the WebAssembly assertion was updated to accept its node-table output. The merge-push application CI, native build and WebAssembly build also passed.
- PR #567 is merged to `main` at `6559b5c28f18da7340454db2465a7dca97b02d85`. Production `/release.json` reports that exact commit and 677 deployed files.
- The connected Supabase project is shared across company applications. PR #568 adds optional email sign-in without project upload; the current company-wide Auth Site URL was preserved and `https://adigunsimulator.hephzibahbehulah.com/` was added to the redirect allowlist. The cloud implementation uses namespaced simulator tables rather than the existing shared `projects` tables. PR #569 migration applies owner-only RLS, cascaded user/project deletion, 10 projects per account, 1.5 MB database and 1.4 MB client document caps, and five-version retention. Cloud saves are explicit; data remains until deletion. The Supabase Free quota is shared and must be monitored; no billing-tier change is included. Privacy, limits, manual incident response, and provider backup caveats are documented in OPT_IN_CLOUD_SAVES.md.
- Earlier PR #547 added automated coverage for document-level `pointercancel` routing to the via editor. Live browser cancellation and touch/device acceptance remain open; incremental deployment does not complete the broader product release gates.

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
| Stored via integration | Render/select via endpoints; preserve layer continuity; include copper/drills and exclude vias from BOM. | Creation, editing, coordinate picking, guarded keyboard nudging, removal, undo and two-layer export are implemented. Browser CRUD, selection, keyboard nudging and direct dragging are recorded in `PCB_VIA_EDIT_ACCEPTANCE.md`; live browser cancellation and touch/device acceptance remain open. |
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

## PCB quarter-turn placement checkpoint — 2026-11-09

| Category / checkpoint | Completion criterion | Evidence |
| --- | --- | --- |
| Placement geometry | Rotate stored SMD/through-hole pads and same-net attached vertices without altering net identity or other-view placement; reject unsupported geometry and board overflow. | Automated quarter/inverse/four-turn, precise pad extent, immutable rejection and net-preservation tests pass. |
| UI and document integrity | Localized controls create one undoable edit, retain native orientation and report that orientation in placement CSV. | Browser right/left rotation, Undo/Redo and native export passed; eight locale/width cases passed. |
| Copper safeguard | Editing may reveal violations; a failed DRC must prevent fabrication output. | Rotated USB-C R1 produced two clearance failures; browser and automated export both blocked. |
| Validation and synchronization | Full suite, syntax/library checks, reviewed staging and matching local/GitHub commit with successful CI. | Local 400/400 tests and required checks passed; final push/equality/CI evidence is recorded on PR #505 after synchronization. |
| Production promotion | Independent electrical/release review, protected merge and exact-commit Pages/browser verification pass. | Not performed: PR #505 remains draft without submitted reviews. |

See `PCB_ROTATION_ACCEPTANCE.md` for the relative-angle convention, checks, exclusions and remaining placement capabilities. This advances product milestones 2 and 4; neither milestone is fully accepted. The five-item delivery checklist is distinct from whole-product completion.

## Plated via editing checkpoint — 2026-11-09

| Category / checkpoint | Completion criterion | Evidence |
| --- | --- | --- |
| Via model | Create/move/resize/remove with unchanged canonical nets; apply bounds, copper, keep-out, drill and stack guards. | Automated mutation/rejection tests and native round trips pass; same-net trace-interior anchors follow moves on both layers. |
| Editor workflow | Localized inspector, transformed coordinate picker, safe keyboard selection/removal and single-edit history work. | Browser CRUD, Undo/Redo, 125% picking and component-preserving Delete passed; eight locale/width cases passed. |
| Routing/export integrity | New vias can be routed; isolated or conflicting geometry must not fabricate. | Browser isolated-via export blocked; routed/moved via passed bounded DRC. Automated output includes both copper flashes and drill, excluding the via from BOM. |
| Validation and synchronization | Required checks pass; reviewed commit is pushed, local/remote heads match and current-head CI passes. | Local 412/412 tests, syntax and library validation passed; final synchronization/CI evidence is recorded on PR #505. |
| Production promotion | Independent electrical/release review, protected merge and exact-commit Pages/browser verification pass. | Not performed: PR #505 remains draft without reviews. |

See `PCB_VIA_EDIT_ACCEPTANCE.md` for scope and limitations. Product milestones 2 and 4 remain open; this is bounded implementation progress, not full product or manufacturing acceptance.


## Empty canvas lifecycle checkpoint — 2026-11-09

| Category / checkpoint | Completion criterion | Evidence |
| --- | --- | --- |
| Session isolation | Boot/New/Close are blank; selection, camera, history, drafts and pending work reset without deleting manual saves. | Automated session and stale-import tests; browser New, clean reload, close/new tab and saved reopen passed. |
| Unsaved protection | Only dirty work requests native unload confirmation; cancelled leave preserves data; in-app cancellation preserves the design. | Lifecycle event tests pass. Browser Keep editing/Escape passed; native prompt acceptance is still unverified in this browser automation. |
| Save/load compatibility | Imports/examples remain dirty; successful local save/native export clears dirty; failures preserve protection. | Actual-handler tests and browser import, Save, native download and explicit saved reopen passed. |
| Localization and validation | Required checks pass and localized modal buttons fit desktop/mobile. | Eight locale/width browser cases passed; final full-suite, synchronization and CI evidence recorded in PR #505. |
| Production promotion | Independent reviews, protected merge and exact Pages deployment pass. | Pending; draft PR #505 has no submitted reviews. No deployment performed. |

See `CANVAS_SESSION_ACCEPTANCE.md`. This supersedes automatic recovery/startup behavior described in older checkpoints; the recovery example is an isolated storage test, not session restoration. Broad product milestones remain open.


## Board setup and shared rules checkpoint — 2026-11-09

| Category / checkpoint | Completion criterion | Evidence |
| --- | --- | --- |
| Board setup | Create/edit rectangular board dimensions, thickness, F.Cu/F.Cu+B.Cu layers, minimum trace width and clearance without moving copper or changing nets. | Automated native-document tests and browser empty/populated-board editing passed. |
| Geometry/layer safeguards | Reject clipped copper/obstacles/mechanical allowances and layer removal that strands routes/vias/zones; preserve unsupported multilayer plans. | Automated geometry/layer tests passed; browser unsafe shrink and single-layer conversion were blocked. |
| Rule/export integrity | Apply the strictest board/class trace width; reject violating copper at export and report actual board settings. | Routing/export tests passed; browser stricter-width export blocked and Undo restored passing checks. |
| UI/history and checks | Localized accessible form, no-op/cancel/rejection safety, history, native export and required checks pass. | New-board Undo/Redo, eight locale/width cases, Escape and downloaded native board settings verified; 432/432 tests and matching-head CI evidence recorded on PR #505. |
| Production promotion | Independent reviews, protected merge and exact Pages deployment pass. | Pending; PR #505 remains draft. No production deployment performed. |

See `PCB_BOARD_SETUP_ACCEPTANCE.md`. This advances milestones 2 and 4; it does not complete the professional PCB or product specification.


## Net classes and owner-authorized release checkpoint — 2026-11-09

| Category | Completion criterion | Evidence |
| --- | --- | --- |
| Class editing | Create/rename/edit/remove classes and reassign nets without moving copper or changing native connectivity; retain Undo/Redo. | Model/controller tests and browser create/rename/remove/history passed. |
| Pair rules and compatibility | Edit/remove symmetric or same-class pair rules; preserve legacy id/name formats and optional metadata; block invalid rules. | Tests cover both formats, same-net exclusion, duplicate/unknown rules, numeric rejection and four existing manufacturing packs. |
| Shared enforcement | Board/class/pair floors govern routing, DRC and export; no invalid-data bypass or unbounded report loop. | Width/clearance, malformed-input and workload tests passed; browser 10 mm pair rule blocked fabrication and Undo restored passing checks. |
| UI/release validation | Four locales, desktop/mobile layouts and required checks pass; commit and synchronize. | Eight browser layout cases passed; 442/442 tests, syntax/library checks passed. Final SHA/CI on PR #505. |
| Publish | Owner-reviewed release uses ordinary PR merge and matching Pages/live checks. | Explicit owner authorization received; final execution result recorded on PR #505. |

See `PCB_NET_CLASS_ACCEPTANCE.md`. Remaining stackup/outline/via-rule, library verification, broader simulator and production-acceptance requirements stay in the original goal.

## Incremental deployment evidence — 2026-11-13

- PR #597 wraps mobile component-category filters into touch-sized controls; PR #598 gives compact command menus 44px targets; PR #599 displays the active project name separately from the example load picker.
- Each PR passed exact-head CI. Merge-triggered workflows for #597, #598, and #599 completed test, library validation, syntax/build, and deploy jobs successfully. The latest merge commit is `4c0a7a5600a959d6ed22ba52f1a2388e0ffdde9f`.
- Production was opened after the #599 deploy. It showed “Untitled Circuit” at boot and “Example 001 — LED Current Limiter” after loading that example; the independent save indicator showed “Unsaved changes.”
- This browser check verifies active-name display/update, not crash recovery, manual account signup, cloud-save privacy workflows, all mobile gestures, electrical review, or full product acceptance. Those remain open.
