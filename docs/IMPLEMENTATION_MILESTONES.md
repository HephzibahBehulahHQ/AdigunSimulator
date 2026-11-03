# AdigunSimulator implementation milestones

This tracker records evidence-backed progress against the product requirements. A milestone is complete only when its criteria pass on the reviewed branch; a green unit-test suite alone does not establish browser acceptance, electrical validation, or production readiness.

| Milestone | Verifiable completion criteria | Current state |
| --- | --- | --- |
| 1. Product foundation and project safety | Local-first project format, save/import/export/recovery, responsive workspace, four interface locales, and disclosed scope limits pass automated checks and representative browser workflows. | In progress. Automated and localization contracts exist; representative browser/accessibility acceptance remains outstanding. |
| 2. Circuit editing and synchronized views | Breadboard, schematic, and PCB share project identity and nets; supported component placement/wiring edits synchronize across views; invalid and unsupported mappings are surfaced. | In progress. Shared identity/net model is implemented; broader edit synchronization and browser acceptance remain open. |
| 3. Bounded simulation and instruments | Each advertised model has an explicit model boundary, reproducible examples, numerical tests, cancellation/resource limits, and independent engineering review before release. | In progress. Multiple bounded analyses are tested; general SPICE, broad mixed-signal behavior, and independent review remain unavailable. |
| 4. PCB routing and fabrication preview | Supported layer/endpoint rules, net/clearance/keep-out checks, export integrity, and documented limitations are tested; production use additionally requires independent electrical and manufacturing review. | Branch milestone complete, release pending. F.Cu routes same-net pads; B.Cu routes plated through-hole pads on declared two-layer boards. No vias, bottom-side SMD routing, or standards-complete DRC. Commit `b9a4e5e7ca2e97960fd3150b286924c714b96501`; local suite 362/362; GitHub Actions run #1248 passed. |
| 5. Real component library | Reach 1,000 parts counted only after authoritative datasheet/checksum, exact MPN/package/lifecycle, audited pin/pad mapping, model/licence status, and named dated review are present. Taxonomy types and candidates are reported separately. | In progress. The ledger has 565 taxonomy types, 15 candidates, and 0 verified parts; target completion is 1,000 verified parts. |
| 6. Ready-made project catalogue | Each of the 200 projects has a native project, stable test ID, automated acceptance result, engine/model/library evidence, BOM where applicable, and proportionate safety note. | In progress. Catalogue coverage exists; completion requires per-project evidence under the release gate, not count alone. |
| 7. Adigun BOT and optional accounts | Local deterministic help stays grounded in checked-in project/library data; any external AI requires separate approval. Authentication remains optional until identity, privacy, retention, incident, deployment, and budget decisions are approved. | Local BOT capability exists. External AI and account/cloud features are gated on product-owner decisions. |
| 8. Release quality and production | Automated checks and representative browser, responsive, keyboard, accessibility, privacy/security, independent electrical, rollback, monitoring, and deployment approvals pass. Merge through the normal protected PR path; verify the Pages commit and live release. | Blocked for this branch. CI is green, but PR #505 remains draft and independent electrical/release approvals are not evidenced. No deployment is claimed. |

## Current branch verification

- Branch: `codex/rl-transient-acceptance`.
- PCB milestone baseline: `b9a4e5e7ca2e97960fd3150b286924c714b96501`; consult the branch for subsequent commits.
- Required automated checks: 362 tests passed; syntax check, library validation, and `git diff --check` passed; GitHub Actions run #1248 passed.
- Deployment: not performed. The checked-in deployment runbook requires a non-draft review path, current-head checks, independent electrical review, and approved release safeguards before merge/deployment.

Update this tracker when a milestone's evidence changes. Do not count candidates as verified parts, planned examples as released projects, or an illustrative PCB export as manufacturing approval.

## Workspace startup and Run recovery — 2026-11-03

- The previous Python preview served `.mjs` as `text/plain` on this Windows machine. The new `npm run dev` server uses explicit JavaScript MIME types and a fixed simulator root. HTTP regression tests traverse the startup and worker import graph and cover JSON, HEAD, asset types, private paths, malformed URLs and rejected writes.
- Browser execution then exposed three single-element selectors incorrectly used as collections in localization and diagnostics. Those prevented initial rendering; all three now select collections.
- The Run completion handler also formatted every unrecognized result as a resistor-network result, throwing on the default STM32 example. That formatter now applies only to its declared result kind.
- Browser checks now show 276 starter entries, populated canvas, the current-year footer, working English/German/Yoruba/Pidgin switching, STM32 PWM results (1.00 kHz, 49.9%, 3.94 mA on-current), and working Errors/Output tabs. No new console errors appeared in the corrected Run/diagnostics checks. These are bounded startup checks, not full browser acceptance.
- Six new automated tests cover HTTP delivery and execution of the actual localization, diagnostic-tab and result-completion functions. The local suite passed 368/368, with syntax, library validation and whitespace checks passing. Full release, manufacturing and independent electrical review remain open.
