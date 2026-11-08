# ADIGUNSIMULATOR — MASTER PRODUCT, ENGINEERING, UX, QA AND DELIVERY SPECIFICATION

**Status:** Draft for approval — planning only; this document does not authorize repository changes, cloud configuration, releases, or deployment.  
**Product owner:** Hephzibah Behulah  
**Division:** HB Elektroniker  
**Product:** AdigunSimulator  
**Canonical source repository:** `https://github.com/HephzibahBehulahHQ/AdigunSimulator`

---

## 1. Executive instruction and verified starting point

Act as a coordinated team of senior electrical and electronics engineers, circuit-simulation engineers, PCB engineers, software architects, frontend and backend engineers, UX designers, QA engineers, accessibility specialists, technical writers, and security engineers. Build a credible engineering application—not a static mockup of one.

### 1.1 Evidence used for this specification

- The owner’s full supplied requirements, including the demand for professional breadboard, schematic, PCB, simulation, component-library, localization, AI-assistant, example-project, testing, and staging work.
- The supplied interface mockup. It shows the intended dark engineering-workspace hierarchy: corporate/product header; search, language and appearance controls; command bar; component library; coordinated Breadboard, Schematic and PCB views; properties and simulation controls; diagnostics/output; and a floating Adigun BOT.
- `HephzibahBehulahHQ/AdigunSimulator`: confirmed correct public repository, default branch `main`, **size 0** at inspection. It contains no application, test, build, or documentation baseline.
- `HephzibahBehulahHQ/hb-design-system`: its README confirms the corporate palette, Elektroniker’s cyan accent, responsibility for shared assets/components, and the rule that product logic stays in its own repository. Its package/folder structure is explicitly still planned; do not pretend a consumable design-system package exists.
- `HephzibahBehulahHQ/HephzibahBehulahHQ.github.io`: confirms independent product repositories, the five-brand hierarchy, the Elektroniker remit, and security/accessibility principles.
- `HephzibahBehulahHQ/hb-elektroniker`: confirms HB Elektroniker’s electrical/electronics/automation/simulation remit and independent product deployment rule.
- The approved corporate logo asset is present at `hb-design-system/assets/corporate/hephzibah-behulah-official.jpg`.

### 1.2 Non-negotiable repository and ownership boundaries

1. All AdigunSimulator code, tests, assets specific to the product, documentation, configuration, CI, and deployment workflows belong only in `HephzibahBehulahHQ/AdigunSimulator`.
2. The corporate website, HB Elektroniker repository, and shared design system are references only. Do not duplicate AdigunSimulator into them and do not modify them without separate written approval.
3. Consume a versioned shared design-system package only after one actually exists. Until then, record an explicit integration decision and preserve the source/approval for any approved logo or token copied into the product.
4. Do not invent an official font, logo, domain, public URL, manufacturer endorsement, component model, test result, or simulation accuracy claim.
5. Do not deploy, create cloud services, configure a domain, enable billing, or create authentication/database resources under this specification. Those require an approval checkpoint.

### 1.3 Product promise and honest boundaries

AdigunSimulator shall let users create, inspect, validate, simulate, document, and export low-voltage electronic designs through synchronized breadboard, schematic, and PCB representations. A passed simulation or DRC is evidence for the modeled design only; it is **not** certification that a physical build is safe, compliant, manufacturable, mains-safe, medically safe, automotive-qualified, or fit for industrial control.

“Verified” means a part/library record has the evidence defined in section 10. “Tested project” means its supplied acceptance test has actually been executed and recorded. Before that happens, the project is a **testable example**, not a claimed tested design.

---

## 2. Brand, visual system, and responsive workspace

### 2.1 Identity

Use the identity hierarchy exactly:

`Hephzibah Behulah → HB Elektroniker → AdigunSimulator`

The application header shall contain one approved corporate logo, the prominent `AdigunSimulator` product wordmark, and the restrained label `BY HB ELEKTRONIKER`. Do not create multiple competing logos. Use the supplied official logo unmodified; do not redraw, trace, regenerate, recolor, or substitute it.

### 2.2 Confirmed palette and usage

| Token | Value | Required use |
|---|---:|---|
| Midnight Navy | `#0B1220` | Primary dark workspace/header surface |
| Royal Blue | `#2563EB` | Corporate interactive accent and focus support |
| Metallic Gold | `#D4AF37` | Corporate identity and carefully limited primary emphasis |
| Ivory White | `#F8FAFC` | Primary light text/background counterpart |
| Elektroniker Electric Cyan | `#22D3EE` | Engineering/product accent, active mode/status support |
| Slate Grey | `#64748B` | Secondary information where contrast remains compliant |

Provide light and dark themes. Define semantic tokens—not component-specific hard-coded colours—for canvas grid, panel surface, text, border, focus, warning, error, simulation-running, selection, net-highlight, DRC severity, and disabled state. Validate WCAG 2.2 AA contrast, including graph traces and selected PCB layers.

### 2.3 Workspace layout derived from the supplied mockup

**Desktop, 1280 px and wider**

- A compact identity header: official mark, product wordmark and short product descriptor; global search; language; theme; settings/help; user area when enabled.
- A command/menu row: menus on the left, then high-value project actions (`New Project`, `Open`, `Save`, `Export`) on the right.
- A resizable left library rail, central document/canvas region, resizable right inspector rail, bottom diagnostics/output drawer, and non-obscuring Adigun BOT launcher/panel.
- The central region must support tabs and the mockup’s coordinated overview: Breadboard as primary view, with docked Schematic and PCB split panes when the user chooses overview mode. A user can maximize any one view.
- The right rail contains context-sensitive Properties, Project and Simulation tabs, plus a Simulation Control section only when a project has a valid simulation configuration.
- The bottom panel contains Simulation Output, Errors, Warnings, Messages, Test Results, ERC, DRC and performance/progress views.

**Tablet and mobile**

- Do not compress the full desktop into unreadable columns. Collapse library/properties/output into accessible drawers; show one primary design canvas at a time; use a workspace switcher for Breadboard, Schematic, PCB, output, and BOT.
- Preserve keyboard/screen-reader access and touch targets of at least 44 × 44 CSS px where practical.
- Do not make technical text truncate without a reveal mechanism. Never allow panels, dialogs, dropdowns, canvas controls, tooltips, or BOT to overlap critical controls or extend beyond the viewport.

### 2.4 Interaction rules

- All panes are resizable, collapsible and resettable. Persist layout locally per user/device only after consent where required.
- Toolbars are context-sensitive; a control is visible only if implemented or is visibly disabled with a truthful reason and a link to its documented roadmap. Never display decorative dead buttons.
- Every icon has a text label or accessible name, keyboard shortcut where appropriate, tooltip, focus ring, disabled explanation, and automated action test.
- Save status is explicit: `Saved`, `Saving`, `Unsaved changes`, `Offline`, `Conflict requires resolution`, or `Save failed`.

### 2.5 Standard footer and verified external links

Use a compact footer that remains below the engineering workspace and does not consume usable canvas height on smaller screens. Include the product/division identity, documentation/support/contact links only once they exist, and the official corporate website: `https://hephzibahbehulah.com/`. Where the owner approves the existing links for release, use: Facebook `https://www.facebook.com/Hephzibahbehulah/`; X `https://x.com/HephzibaBehulah`; Instagram `https://www.instagram.com/hephzibahbehulah`; TikTok `https://www.tiktok.com/@hephzibahbhehulah`; and LinkedIn `https://www.linkedin.com/in/isaacoluwoleadigun/`, labelled clearly as a **personal profile**. Validate every outbound link in CI; omit a broken or unapproved link rather than substituting one.

---

## 3. Product scope and implementation principles

### 3.1 Required capabilities

1. Local project creation, import/export, version-safe storage, and recovery of unsaved work.
2. Breadboard design with genuine hole/rail topology, placement, lead/pin mapping, wire routing, orientation, and connectivity validation.
3. Standards-aware schematic editing with symbols, references, net labels, junctions, electrical properties, annotation, ERC, BOM and documents.
4. PCB design with derived footprints/netlist, board setup, placement, routing, layers, zones, DRC, 3D preview where valid geometry exists, and manufacturing-document export.
5. Credible analog, digital and mixed-signal simulation with traceable models, virtual instruments, waveforms and diagnostics.
6. A library target of 1,000 verified real part records, spanning the explicitly enumerated 565 component types in section 11.
7. 200 supplied project files, each with a component list, expected behaviour, acceptance test, evidence record and safety note, defined in section 12.
8. English, German, Yoruba, and Nigerian Pidgin English user interfaces and documentation surfaces.
9. A secure Adigun BOT that explains and assists only through documented, validated product operations.
10. Accessibility, privacy, performance, security, observability, test automation, and release evidence appropriate to an engineering application.

### 3.2 Explicit exclusions until separately approved and proven

- Physical manufacture, installation, certification, warranty, regulatory approval, or safety approval.
- Direct programming/flashing of a physical microcontroller/PLC, unless a device-specific, licensed, secure and tested connector is later approved.
- Cloud synchronization, social sign-in, team sharing, paid services, or database-backed accounts in the base release.
- Simulation of a part lacking a licensed, validated model. Such a part may be schematic/PCB-only, but its status must say so.
- Claims of exact parasitics, RF/EMC, thermal, mechanical, high-voltage or safety performance without an implemented and verified model.

---

## 4. Canonical project data model and three-view synchronization

### 4.1 Single source of truth

Do not synchronize three unrelated drawings. Persist one versioned **Circuit Document** and derive presentation-specific layouts from it.

```text
Project
 ├─ metadata, locale, units, board/simulation profiles and audit metadata
 ├─ library lockfile: exact approved PartDefinition versions
 ├─ ComponentInstance[]: stable instanceId, reference, value, partDefinitionId
 ├─ PinInstance[]: pin identity, electrical type, mapped terminal/lead/pad
 ├─ Net[]: stable netId, labels, class, electrical constraints
 ├─ Connection[]: endpoint-to-net relationship; never infer identity from pixels
 ├─ BreadboardLayout: board topology, hole/rail placements, wires and geometry
 ├─ SchematicLayout: symbols, graphical wires, labels, annotations and sheets
 ├─ PcbLayout: board outline, stack-up, footprint placements, pads, tracks, vias/zones
 ├─ SimulationProfile[]: engine, analyses, models, stimuli, probes and limits
 ├─ ValidationResults[]: ERC/DRC/connectivity/model/version evidence
 └─ History[]: command-level, reversible changes and conflict/reconciliation records
```

Use a documented JSON Schema plus TypeScript interfaces for the Circuit Document. Schema versions must migrate forward with fixtures and migration tests. Never silently discard a field or regenerate identifiers during import.

### 4.2 Identity and mapping requirements

Each usable component record must define:

- One immutable part-definition ID and version; manufacturer, manufacturer part number and supplier SKU only when verified.
- A symbol pin map, physical package pin map, PCB footprint pad map, and breadboard lead/adapter map where applicable.
- Pin electrical type, allowed net class, unit/value/rating constraints, 3D model status, SPICE/digital model status and license/provenance.
- Stable instance ID, reference designator, user value/variant, orientation and placement per view.

### 4.3 Propagation and reconciliation rules

| Change origin | Automatic effect | Must not happen automatically |
|---|---|---|
| Schematic component/net edit | Update canonical component/net; update PCB ratsnest and any valid breadboard connection mapping | Do not invent breadboard lead positions, add jumper wires, choose a footprint, or reroute copper |
| Breadboard placement/wire edit | Resolve hole/rail topology into canonical nets; update schematic connectivity after validation | Do not invent a schematic symbol arrangement, PCB placement, or unverified wire-to-pin mapping |
| PCB footprint/net edit | Update canonical PCB mapping/net intent where unambiguous; report changed connectivity | Do not move breadboard parts, alter schematic topology invisibly, or route a logical change without confirmation |
| Part substitution | Preserve instance ID only after compatible pin mapping is confirmed | Do not replace a pin-incompatible part or silently change ratings/models |

When a view cannot represent an item (for example, a BGA on a solderless breadboard, a missing footprint, an incompatible pin count, a mechanical-only part, or a PCB short introduced by routing), add a blocking reconciliation item. Show source, effect, options, data loss risk, and undo. The user must choose `Map`, `Keep unresolved`, `Replace part`, or `Discard this change`; never guess.

### 4.4 Import/export baseline

- Native: versioned `.adigun` project JSON package with assets, lockfile, checksums and a human-readable manifest.
- Import/export adapters must be isolated behind ports; ship only formats actually tested. Candidate adapters include KiCad schematic/netlist/footprint/PCB exchange, SPICE netlist, CSV BOM, SVG/PDF and image exports.
- Preserve provenance and issue report on lossy imports. Do not claim round-trip fidelity before fixture-based proof.

---

## 5. Editors and engineering functionality

### 5.1 Breadboard editor

Implement actual board definitions: row/column holes, tie strips, split/continuous power rails, orientation, clipping rules, jumper-wire endpoints, breadboard dimensions, and supported board accessories. Required operations: select, drag, drop, rotate, mirror where physically valid, duplicate, nudge, delete, zoom, pan, grid/snap, wire, label, inspect, group, align, undo/redo, fit, validate, and find.

Placement must validate pin/lead geometry and report rather than hide: floating lead, same-row short, unconnected pin, incompatible component, rail discontinuity, excessive wire bend, and non-breadboard-compatible package. A visual breadboard drawing alone is not a circuit.

### 5.2 Schematic editor

Support multi-sheet documents, symbols, electrical pin types, wire/net labels, buses, junctions, ports, hierarchical blocks, annotations, reference assignment, values, fields, units, designators, cross-probes, ERC, BOM generation, print/PDF/SVG, and simulation probes. Symbols must follow an identified library convention and have test fixtures for pin direction/orientation.

### 5.3 PCB editor

Required baseline: board outline; stack-up; layer manager; net classes; clearance/width/via rules; footprints; courtyard/fab/silkscreen views; pads/tracks/vias; zones; ratsnest; differential/net constraints only where implemented; DRC; connectivity report; design documentation; Gerber X2 and Excellon drill export; BOM and placement CSV. Add 3D preview only for components with valid 3D assets and mark missing geometry honestly.

The first release must use interactive routing. Autorouting, length tuning, impedance control, high-speed constraints, panelization, pick-and-place optimisation and IPC-2581 are later phases and must remain unavailable/disabled until independently implemented and tested.

### 5.4 Cross-probing and validation

Selecting an instance, pin, pad, net, or DRC/ERC error highlights the same canonical object in all available views. Validation must distinguish:

- **Error:** design cannot be simulated/exported safely within product rules.
- **Warning:** may be intentional but needs acknowledgement.
- **Information:** non-blocking assistance.

Each message supplies rule ID, object ID, view/location, cause, safe repair suggestion, and a link to documentation. Do not use generic “circuit failed” messages.

---

## 6. Realistic simulation architecture

### 6.1 Recommended engine boundary

Use a worker-isolated simulation service with a documented adapter layer:

- **Analog:** a maintained SPICE-compatible engine, selected only after license, browser/WASM feasibility, numerical stability, and test-circuit evaluation. `ngspice` is a candidate, not an assumed dependency; complete license and distribution review before adoption.
- **Digital:** a native deterministic discrete-event engine for gates, sequential logic and supported microcontroller peripheral abstractions.
- **Mixed signal:** explicit A/D and D/A bridge elements with sample rate, thresholds, slew/impedance behaviour and limitations shown in the UI.
- **Worker boundary:** no engine blocks the UI; cancellation, maximum run time, memory limit, model sandboxing and structured error propagation are mandatory.

### 6.2 Analyses and instruments

Implement only when the engine adapter and automated reference tests exist: DC operating point; DC sweep; transient; small-signal AC; parameter sweep; Monte Carlo only with documented distributions; digital timing/event trace; and selected mixed-signal runs. Virtual tools include voltmeter, ammeter, oscilloscope, logic analyser, function generator, frequency counter, Bode plot, power meter and spectrum view only where genuine data exists.

Every result must expose engine, version, model IDs/versions, analysis settings, tolerances, timestamp, convergence state, warnings, and units. Never print fabricated “converged successfully” or a decorative waveform.

### 6.3 Model and result safeguards

- Validate component compatibility and pin/net types before launch.
- Declare simulation availability as `full`, `limited`, `schematic/PCB only`, or `unavailable` for every part.
- Detect/reveal floating nodes, invalid sources, shorts, missing ground/reference, unsupported models, divergence, timestep under-resolution, and cancelled/limited runs.
- Compare reference circuits against analytical expectations and licensed/reference model output using tolerances recorded per circuit.
- Prevent unbounded netlists, hostile model directives, arbitrary file access, shell execution, and remote code execution.

---

## 7. Menu, commands, toolbars, and buttons

Every command listed below is a contract: implement it and test it before enabling it. If a command is deferred, omit it from the release UI or show it disabled with an accessible, truthful `Not available in this release` explanation. Menu labels must be translated; keyboard shortcuts remain discoverable and configurable.

### 7.1 Main menu

| Menu | Required commands |
|---|---|
| **File** | New Project, New Circuit, Open, Open Recent, Import, Save, Save As, Save All, Export, Print/Print Preview, Project Properties, Close Project |
| **Edit** | Undo, Redo, Cut, Copy, Paste, Duplicate, Delete, Select All, Find, Rename, Rotate, Mirror, Align, Distribute, Group, Ungroup, Preferences |
| **View** | Zoom In/Out, Actual Size, Fit, Pan, Grid, Snap, Rulers, Guides, Show Pin Numbers, Show References, Show Net Names, Layer Visibility, Panels, Workspace Layout, Full Screen, Theme, Reset Layout |
| **Insert** | Component, Power Port, Ground, Wire, Junction, Bus, Label, Net Label, Hierarchical Port, Test Point, Measurement Instrument, Note, Image/Mechanical Reference where supported |
| **Design** | Annotate, Assign Footprints, Update PCB from Schematic, Synchronization Review, ERC, BOM, Net Classes, Design Rules, Variant Manager, Cross-Probe |
| **Simulation** | Configure, Run, Pause, Stop, Reset, Single Step, Analysis Type, Stimuli, Initial Conditions, Probes, Instruments, Waveforms, Results, Simulation Report |
| **PCB** | Board Setup, Layer Manager, Place Footprint, Route Track, Via, Zone, Measure, Refill Zones, DRC, 3D Preview, Gerber, Drill, Assembly/BOM Export |
| **Tools** | Component Manager, Symbol Manager, Footprint Manager, Model Manager, Unit Converter, Electrical Calculators, Keyboard Shortcuts, Diagnostics, Adigun BOT |
| **Project** | Explorer, Validation Summary, Version History, Local Backup, Example Projects, Library Lockfile, Project Settings |
| **Help** | Getting Started, Documentation, Breadboard Guide, Schematic Guide, PCB Guide, Simulation Guide, Model Limitations, Example Projects, Accessibility, Shortcuts, Troubleshooting, About |

### 7.2 Toolbars and high-priority buttons

| Context | Buttons |
|---|---|
| Global | New, Open, Save, Undo, Redo, Command/Search, Help, Language, Theme, Layout Reset |
| Breadboard | Select, Hand/Pan, Place Component, Wire, Rotate, Mirror, Zoom, Fit, Snap, Grid, Inspect, Validate |
| Schematic | Select, Wire, Junction, Power, Ground, Net Label, Bus, Probe, Rotate, Mirror, Annotate, ERC, Cross-Probe |
| PCB | Select, Place Footprint, Route, Via, Zone, Measure, Layers, Ratsnest, DRC, 3D Preview, Manufacturing Export |
| Simulation | Configure, Run, Pause, Stop, Reset, Step, Time/Speed, Add Probe, Scope, Logic Analyser, Results, Report |
| Bottom diagnostics | Filter, Clear Filter, Copy, Jump to Object, Re-run Validation, Export Report |
| Adigun BOT | Open/Close, New Conversation, Attach Current Context, Preview Proposed Changes, Apply Approved Changes, Undo Import, Report Issue |

`New Project`, `Open`, `Save`, and `Export` follow the placement in the visual reference. The green run control must display `Run Simulation` and change state accurately; Pause/Stop must actually control an active worker, not merely toggle appearance.

---

## 8. Adigun BOT — secure engineering assistant

The BOT is a floating, dockable assistant based on the supplied mockup. It must not cover confirmation, error, or primary editing controls. It may be minimized to an accessible launcher.

### 8.1 Supported assistance

- Explain component properties, pinouts, simulation errors, ERC/DRC output, and documented workflow steps using grounded product documentation/library data.
- Search the verified component library and example projects.
- Propose an allowed circuit only as a validated Circuit Document patch.
- Explain why a design has errors and propose repairs as previewable patches.
- Generate a BOM/report draft from the current document.

### 8.2 Mandatory safety and control path

`user request → retrieval from approved documents/parts → structured proposal → schema validation → electrical/connectivity/placement validation → visual diff/preview → explicit user confirmation → native command execution → undoable history entry`

The BOT shall never directly alter the canvas, use arbitrary code/tools, access secrets, fetch unapproved remote content, execute shell commands, or claim a design is safe for mains/medical/industrial use. Send only the minimum project context necessary; redact secrets and personal information. Store conversation/audit data only under an approved privacy policy and retention plan.

When no approved server-side AI configuration exists, show `Adigun BOT is not configured` and a setup/admin explanation; do not simulate answers or pretend the BOT is online.

---

## 9. Localization, documentation, authentication, and privacy

### 9.1 Four complete locales

Ship and test:

1. English (`en`)
2. German (`de`)
3. Yoruba (`yo`)
4. Nigerian Pidgin English (`pcm`)

Localize menus, commands, tooltips, dialogs, validation errors, units/date formats where appropriate, settings, onboarding, documentation UI, examples metadata, empty states, accessibility labels, and BOT controls. Engineering symbols, manufacturer part numbers, net IDs and standard units must not be mistranslated. Use message IDs, ICU-style pluralisation, fallback tracking, linguistic review, layout expansion tests, and a locale completeness gate of 100% for released strings. BOT replies should use the selected language only when supported; otherwise disclose the fallback language.

### 9.2 Authentication decision: optional, not assumed

**Base approved scope:** fully useful local/offline project workflow with no mandatory sign-in. Store local data safely in browser/device storage with export/backup and clear deletion controls.

**Optional authenticated/cloud phase:** build only after written approval of provider, budget, privacy notice, retention, production URL, redirect rules, role model, data region, and security review. A dedicated AdigunSimulator backend/project is required; do not reuse or alter an unrelated product database. Implement email verification, password reset, rate limiting, secure server-side secrets, least-privilege row/storage policies, audit records, account deletion/export, and integration/e2e security tests. Until approved, the account menu may offer only local profile/preferences and an honest `Cloud workspace not enabled` state.

---

## 10. Component library: 1,000 verified part records

### 10.1 Definition of a verified part

The release cannot call a part “verified” until its immutable record has all applicable fields below, has passed automated validators, and has a human evidence review:

- Manufacturer, exact manufacturer part number, lifecycle/source date and authoritative datasheet URL/PDF checksum.
- Category/type, ratings, package, pinout, symbol, footprint, pad-to-pin map, 3D source/status, and licensing/provenance.
- Simulation classification and model source/version/license; a validated test fixture and expected result if modeled.
- Breadboard compatibility/adaptor requirement, operating limits, warnings, substitutions/alternates, and last verification date.
- ERC/DRC pin electrical types, unit data, references and translation-safe descriptions.

No marketplace listing, guessed package, copied model of unknown licence, generic SVG, or visually similar component qualifies. A generic educational component may be included only as `Generic — not manufacturer-specific` and must never be counted toward the 1,000 verified manufacturer part target.

### 10.2 Library completion rule

Deliver at least **1,000 distinct verified real part records** across the 565 types in section 11. Maintain `parts-manifest.json`, evidence files/checksums, a license ledger, per-part test status and a machine-readable coverage report. “1,000” is an acceptance target, not a current claim. A release gate fails if any counted record lacks verification evidence.

At minimum, library CI validates unique MPNs, source URL/checksum presence, symbol pins ↔ footprint pads consistency, valid unit/range metadata, model provenance, asset licence, translated fields, and project fixture compatibility. Licensed third-party libraries may be used only after legal and attribution review.

---

## 11. Explicit component-type catalogue — 565 types

The following types are deliberately explicit so the library cannot be reduced to vague category labels. They are a taxonomy, not a claim that the 1,000 associated manufacturer records are already verified.

### A. Sources, power, and grounds — 35

`A01` ideal DC voltage source; `A02` AC voltage source; `A03` pulse source; `A04` sine source; `A05` arbitrary waveform source; `A06` DC current source; `A07` single battery cell; `A08` battery pack; `A09` bench power supply; `A10` solar cell; `A11` wind-generator source; `A12` fuel-cell source; `A13` single-phase mains source; `A14` three-phase mains source; `A15` protective earth; `A16` chassis ground; `A17` signal ground; `A18` analog ground; `A19` digital ground; `A20` virtual ground; `A21` power port; `A22` voltage reference; `A23` linear regulator; `A24` LDO regulator; `A25` buck regulator; `A26` boost regulator; `A27` buck-boost regulator; `A28` flyback converter; `A29` charge pump; `A30` isolated DC/DC module; `A31` AC/DC power module; `A32` USB power input; `A33` PoE powered-device module; `A34` battery charger IC/module; `A35` supercapacitor power module.

### B. Passive, magnetic, timing, and filter parts — 70

`B01` fixed carbon-film resistor; `B02` fixed metal-film resistor; `B03` thick-film SMD resistor; `B04` precision resistor; `B05` power resistor; `B06` fusible resistor; `B07` current-sense shunt; `B08` Kelvin current-sense resistor; `B09` isolated resistor array; `B10` bussed resistor network; `B11` fixed potentiometer; `B12` rotary potentiometer; `B13` multi-turn trimmer; `B14` rheostat; `B15` NTC thermistor; `B16` PTC thermistor; `B17` LDR/photoresistor; `B18` MOV varistor; `B19` ceramic capacitor; `B20` electrolytic capacitor; `B21` tantalum capacitor; `B22` film capacitor; `B23` mica capacitor; `B24` variable capacitor; `B25` trimmer capacitor; `B26` feedthrough capacitor; `B27` safety X capacitor; `B28` safety Y capacitor; `B29` motor-run capacitor; `B30` motor-start capacitor; `B31` capacitor bank; `B32` supercapacitor; `B33` air-core inductor; `B34` ferrite inductor; `B35` RF inductor; `B36` power inductor; `B37` variable inductor; `B38` choke; `B39` common-mode choke; `B40` ferrite bead; `B41` saturable reactor; `B42` audio transformer; `B43` RF transformer; `B44` pulse transformer; `B45` gate-drive transformer; `B46` isolation transformer; `B47` power transformer; `B48` three-phase transformer; `B49` autotransformer; `B50` current transformer; `B51` toroidal transformer; `B52` impedance-matching transformer; `B53` balun; `B54` crystal resonator; `B55` ceramic resonator; `B56` MEMS oscillator; `B57` RC network; `B58` RLC network; `B59` pi attenuator; `B60` T attenuator; `B61` LC low-pass filter; `B62` LC high-pass filter; `B63` LC band-pass filter; `B64` LC band-stop filter; `B65` EMI power-line filter; `B66` feedthrough EMI filter; `B67` delay line; `B68` piezo resonator; `B69` piezoelectric disc; `B70` ferrite core.

### C. Diodes, emitters, detectors, and opto-isolators — 38

`C01` small-signal diode; `C02` general rectifier diode; `C03` Schottky diode; `C04` fast-recovery diode; `C05` ultrafast diode; `C06` Zener diode; `C07` unidirectional TVS diode; `C08` bidirectional TVS diode; `C09` bridge rectifier; `C10` PIN diode; `C11` varactor diode; `C12` tunnel diode; `C13` step-recovery diode; `C14` constant-current diode; `C15` germanium diode; `C16` red LED; `C17` green LED; `C18` blue LED; `C19` white LED; `C20` yellow/amber LED; `C21` infrared LED; `C22` ultraviolet LED; `C23` RGB LED; `C24` addressable RGB LED; `C25` laser diode; `C26` photodiode; `C27` avalanche photodiode; `C28` phototransistor; `C29` photodarlington; `C30` phototriac optocoupler; `C31` phototransistor optocoupler; `C32` logic-gate optocoupler; `C33` high-speed optocoupler; `C34` linear optocoupler; `C35` opto-MOS relay; `C36` isolation amplifier; `C37` reflective IR sensor; `C38` slotted optical interrupter.

### D. Transistors and discrete switching devices — 35

`D01` NPN BJT; `D02` PNP BJT; `D03` NPN Darlington; `D04` PNP Darlington; `D05` N-channel enhancement MOSFET; `D06` P-channel enhancement MOSFET; `D07` N-channel depletion MOSFET; `D08` P-channel depletion MOSFET; `D09` small-signal JFET N-channel; `D10` small-signal JFET P-channel; `D11` dual-gate MOSFET; `D12` IGBT; `D13` IGBT module; `D14` NPN RF transistor; `D15` PNP RF transistor; `D16` RF MOSFET; `D17` UJT; `D18` programmable UJT; `D19` DIAC; `D20` TRIAC; `D21` SCR/thyristor; `D22` GTO thyristor; `D23` MOSFET driver transistor array; `D24` digital transistor NPN; `D25` digital transistor PNP; `D26` complementary transistor pair; `D27` matched BJT pair; `D28` transistor array; `D29` photodarlington power switch; `D30` avalanche-rated MOSFET; `D31` logic-level MOSFET; `D32` power BJT; `D33` high-side smart switch; `D34` low-side smart switch; `D35` solid-state load switch.

### E. Analog, timing, and interface ICs — 47

`E01` general-purpose op amp; `E02` precision op amp; `E03` rail-to-rail op amp; `E04` instrumentation amplifier; `E05` programmable-gain amplifier; `E06` transimpedance amplifier; `E07` current-sense amplifier; `E08` isolation amplifier; `E09` voltage comparator; `E10` window comparator; `E11` analog switch; `E12` analog multiplexer; `E13` analog demultiplexer; `E14` sample-and-hold; `E15` DAC; `E16` SAR ADC; `E17` delta-sigma ADC; `E18` ADC driver; `E19` precision voltage reference; `E20` band-gap reference; `E21` linear regulator IC; `E22` LDO controller; `E23` buck controller; `E24` boost controller; `E25` buck-boost controller; `E26` flyback controller; `E27` LED constant-current driver; `E28` battery-management IC; `E29` battery fuel-gauge IC; `E30` ideal-diode controller; `E31` load-switch controller; `E32` hot-swap controller; `E33` motor-driver IC; `E34` H-bridge driver; `E35` gate-driver IC; `E36` isolated gate driver; `E37` audio power amplifier; `E38` audio preamplifier; `E39` microphone preamplifier; `E40` audio codec; `E41` active-filter IC; `E42` PLL IC; `E43` VCO IC; `E44` frequency synthesizer; `E45` 555 timer; `E46` 556 dual timer; `E47` watchdog timer.

### F. Digital logic and memory — 67

`F01` NOT gate; `F02` buffer; `F03` tri-state buffer; `F04` AND gate; `F05` NAND gate; `F06` OR gate; `F07` NOR gate; `F08` XOR gate; `F09` XNOR gate; `F10` Schmitt inverter; `F11` Schmitt buffer; `F12` open-drain buffer; `F13` bus transceiver; `F14` bus switch; `F15` level translator; `F16` serialiser; `F17` deserialiser; `F18` multiplexer; `F19` demultiplexer; `F20` priority encoder; `F21` decoder; `F22` BCD-to-seven-segment decoder; `F23` seven-segment driver; `F24` magnitude comparator; `F25` parity generator/checker; `F26` half adder; `F27` full adder; `F28` ALU; `F29` D latch; `F30` SR latch; `F31` JK flip-flop; `F32` D flip-flop; `F33` T flip-flop; `F34` shift register SISO; `F35` shift register SIPO; `F36` shift register PISO; `F37` shift register PIPO; `F38` binary ripple counter; `F39` synchronous binary counter; `F40` up/down counter; `F41` decade counter; `F42` ring counter; `F43` Johnson counter; `F44` programmable timer; `F45` real-time clock; `F46` clock generator; `F47` clock buffer; `F48` clock multiplexer; `F49` monostable multivibrator; `F50` bistable multivibrator; `F51` FIFO; `F52` asynchronous FIFO; `F53` EEPROM; `F54` serial EEPROM; `F55` NOR flash; `F56` NAND flash; `F57` SRAM; `F58` DRAM; `F59` FRAM; `F60` CPLD; `F61` FPGA; `F62` configuration PROM; `F63` JTAG boundary-scan device; `F64` digital isolator; `F65` I²C isolator; `F66` SPI isolator; `F67` USB isolator.

### G. Programmable controllers and computing — 31

`G01` 8-bit microcontroller; `G02` 16-bit microcontroller; `G03` 32-bit ARM microcontroller; `G04` RISC-V microcontroller; `G05` AVR microcontroller; `G06` PIC microcontroller; `G07` ESP32-class Wi-Fi MCU; `G08` STM32-class MCU; `G09` Arduino Uno-class module; `G10` Arduino Nano-class module; `G11` Arduino Mega-class module; `G12` Raspberry Pi Pico-class module; `G13` single-board Linux computer; `G14` system-on-module; `G15` generic compact PLC; `G16` generic modular PLC CPU; `G17` PLC digital-input module; `G18` PLC digital-output module; `G19` PLC analog-input module; `G20` PLC analog-output module; `G21` PLC relay-output module; `G22` PLC communication module; `G23` remote I/O coupler; `G24` industrial HMI; `G25` programmable relay; `G26` CAN controller; `G27` USB-to-UART bridge; `G28` JTAG/SWD debugger; `G29` ISP programmer header/module; `G30` embedded Linux gateway; `G31` real-time co-processor.

### H. Sensors and measurement transducers — 44

`H01` NTC temperature sensor; `H02` RTD sensor; `H03` thermocouple; `H04` digital temperature sensor; `H05` humidity sensor; `H06` barometric-pressure sensor; `H07` differential-pressure sensor; `H08` vacuum sensor; `H09` load cell; `H10` strain gauge; `H11` force-sensitive resistor; `H12` piezo vibration sensor; `H13` accelerometer; `H14` gyroscope; `H15` IMU; `H16` magnetometer; `H17` Hall-effect switch; `H18` linear Hall sensor; `H19` reed switch; `H20` inductive proximity sensor; `H21` capacitive proximity sensor; `H22` photoelectric diffuse sensor; `H23` photoelectric through-beam sensor; `H24` ultrasonic distance sensor; `H25` ToF distance sensor; `H26` PIR motion sensor; `H27` microwave motion sensor; `H28` ambient-light sensor; `H29` colour sensor; `H30` UV sensor; `H31` flame sensor; `H32` smoke sensor; `H33` gas sensor; `H34` CO₂ sensor; `H35` pH sensor interface; `H36` conductivity sensor interface; `H37` soil-moisture sensor; `H38` rain sensor; `H39` water-level sensor; `H40` flow sensor; `H41` rotary encoder; `H42` linear position sensor; `H43` GPS/GNSS receiver; `H44` current transducer.

### I. Displays, indicators, audio, and user input — 24

`I01` single LED indicator; `I02` LED bargraph; `I03` seven-segment digit; `I04` four-digit seven-segment module; `I05` fourteen-segment display; `I06` dot-matrix LED display; `I07` character LCD; `I08` graphic LCD; `I09` monochrome OLED; `I10` colour OLED; `I11` TFT LCD; `I12` e-paper display; `I13` VFD display; `I14` RGB LED strip; `I15` piezo buzzer; `I16` magnetic buzzer; `I17` speaker; `I18` electret microphone; `I19` MEMS microphone; `I20` tactile pushbutton; `I21` momentary switch; `I22` latching pushbutton; `I23` rotary encoder with switch; `I24` membrane keypad.

### J. Connectors, cables, and interconnects — 32

`J01` single-pin header; `J02` male pin header; `J03` female socket header; `J04` IDC box header; `J05` ribbon-cable connector; `J06` screw terminal block; `J07` pluggable terminal block; `J08` spring-cage terminal; `J09` barrier terminal strip; `J10` banana jack; `J11` binding post; `J12` barrel power jack; `J13` USB Type-A; `J14` USB Type-B; `J15` Micro-USB; `J16` USB-C receptacle; `J17` HDMI connector; `J18` DisplayPort connector; `J19` RJ45 Ethernet jack; `J20` RJ11/RJ12 jack; `J21` DB9 connector; `J22` DB25 connector; `J23` D-sub high-density connector; `J24` BNC connector; `J25` SMA connector; `J26` RP-SMA connector; `J27` MMCX connector; `J28` U.FL connector; `J29` JST connector; `J30` Molex KK connector; `J31` edge-card connector; `J32` test-point loop.

### K. Electromechanical, protection, and industrial parts — 42

`K01` SPST switch; `K02` SPDT switch; `K03` DPDT switch; `K04` rotary selector switch; `K05` DIP switch; `K06` slide switch; `K07` reed relay; `K08` signal relay; `K09` power relay; `K10` latching relay; `K11` solid-state relay; `K12` time-delay relay; `K13` contactor; `K14` auxiliary contact block; `K15` thermal overload relay; `K16` motor-protection breaker; `K17` fuse; `K18` resettable PTC fuse; `K19` miniature circuit breaker; `K20` residual-current device; `K21` surge protection device; `K22` disconnect switch; `K23` emergency-stop switch; `K24` key switch; `K25` limit switch; `K26` foot switch; `K27` joystick switch; `K28` solenoid valve coil; `K29` pneumatic valve; `K30` DC motor; `K31` brushed DC gearmotor; `K32` stepper motor; `K33` servo motor; `K34` single-phase induction motor; `K35` three-phase induction motor; `K36` BLDC motor; `K37` fan; `K38` pump; `K39` heater; `K40` thermal fuse; `K41` panel pilot lamp; `K42` safety relay.

### L. RF, wireless, and communication parts — 20

`L01` AM receiver module; `L02` FM receiver module; `L03` BLE module; `L04` Wi-Fi module; `L05` Zigbee module; `L06` LoRa module; `L07` GSM/LTE modem; `L08` GNSS antenna; `L09` ceramic antenna; `L10` PCB trace antenna; `L11` whip antenna; `L12` RFID reader; `L13` NFC module; `L14` infrared receiver; `L15` RS-232 transceiver; `L16` RS-485 transceiver; `L17` CAN transceiver; `L18` LIN transceiver; `L19` Ethernet PHY; `L20` isolated Ethernet module.

### M. Power electronics and conversion assemblies — 25

`M01` single-phase diode bridge module; `M02` three-phase diode bridge; `M03` half-bridge IGBT module; `M04` full-bridge IGBT module; `M05` MOSFET half-bridge module; `M06` intelligent power module; `M07` AC solid-state switch; `M08` TRIAC dimmer module; `M09` SSR output module; `M10` AC motor inverter drive; `M11` BLDC controller; `M12` stepper-driver module; `M13` servo-drive module; `M14` USB PD sink controller; `M15` USB PD source controller; `M16` wireless charging receiver; `M17` wireless charging transmitter; `M18` solar charge controller; `M19` MPPT controller; `M20` BMS protection board; `M21` active balancing board; `M22` UPS module; `M23` inverter module; `M24` isolated gate-drive power supply; `M25` programmable electronic load.

### N. PCB, mechanical, test, and fabrication resources — 30

`N01` FR-4 board outline; `N02` flex PCB outline; `N03` rigid-flex region; `N04` mounting hole; `N05` plated mounting hole; `N06` NPTH mounting hole; `N07` fiducial; `N08` tooling hole; `N09` castellated pad; `N10` edge-plated pad; `N11` solder jumper; `N12` solder bridge pad; `N13` thermal relief; `N14` copper pour; `N15` keep-out area; `N16` board cut-out; `N17` slot; `N18` panel tab; `N19` V-score marker; `N20` test pad; `N21` pogo-pin test point; `N22` Kelvin test point; `N23` jumper wire link; `N24` zero-ohm link; `N25` heatsink; `N26` thermal pad; `N27` standoff; `N28` enclosure reference; `N29` QR/serial marking; `N30` calibration label.

### O. Packages, thermal, and protection accessories — 25

`O01` axial through-hole package; `O02` radial through-hole package; `O03` DIP package; `O04` SIP package; `O05` TO-92 package; `O06` TO-220 package; `O07` TO-247 package; `O08` SOT-23 package; `O09` SOT-223 package; `O10` SOIC package; `O11` TSSOP package; `O12` QFN package; `O13` QFP package; `O14` BGA package; `O15` LGA package; `O16` DPAK package; `O17` D²PAK package; `O18` 0201 passive footprint; `O19` 0402 passive footprint; `O20` 0603 passive footprint; `O21` 0805 passive footprint; `O22` 1206 passive footprint; `O23` heat spreader; `O24` thermal interface pad; `O25` conformal-coating keep-out.

---

## 12. Catalogue of 200 individually specified, testable example projects

For every example, deliver a native project file, readme, schematic, breadboard layout where physically appropriate, PCB layout where applicable, BOM with exact part versions, expected outputs, safety note, automated/reference test, and recorded result. The table below defines the required starting catalogue. `Test` is the acceptance criterion; it is not a claim the test has already passed.

| # | Project | Core parts / circuit | Expected behaviour and acceptance test |
|---:|---|---|---|
| 1 | LED current limiter | 5 V source, red LED, 330 Ω resistor | LED current is within calculated tolerance; test compares simulated current to V/R-based expected range. |
| 2 | Two-LED polarity indicator | DC source, anti-parallel red/green LEDs, resistors | Reversing polarity switches the lit LED; test both source polarities. |
| 3 | Pushbutton LED | 5 V, switch, pull-down, LED | LED changes only while pressed; test no floating input warning. |
| 4 | Latching LED switch | SPDT switch, LED, resistor | Each switch position holds one defined state; test continuity/net state. |
| 5 | PWM LED dimmer | MOSFET, PWM source, LED load | Duty-cycle sweep changes average LED current monotonically; test 10/50/90%. |
| 6 | Battery discharge monitor | 9 V battery model, divider, comparator, LED | LED asserts below threshold; test threshold crossing ± tolerance. |
| 7 | 5 V linear supply | transformer, bridge, capacitor, 7805-class regulator | Output regulates near 5 V within load range; test ripple and dropout warning. |
| 8 | USB-powered LED | USB 5 V, LED, resistor, polyfuse | LED works with protected input; test normal and overload warning paths. |
| 9 | Solar garden light model | solar cell, battery, diode, LDR, LED | LED turns on at low light and charges in light; test day/night stimuli. |
| 10 | Supercapacitor hold-up | supply, diode, supercapacitor, load | Load voltage decays according to C/load; test hold-up duration range. |
| 11 | RC charge/discharge | 5 V, R, C, switch | Capacitor follows exponential charge/discharge; test time at 63.2%. |
| 12 | RC low-pass filter | sine source, R, C | Output amplitude drops above cutoff; test calculated cutoff ± tolerance. |
| 13 | RC high-pass filter | sine source, R, C | Output attenuates below cutoff; test Bode points. |
| 14 | Passive tone control | R/C network, audio source/load | Low/high response changes with control; test response plots. |
| 15 | Bridge rectifier | AC source, bridge, load | Output is full-wave rectified; test ripple frequency is 2× input. |
| 16 | Smoothing capacitor | rectifier, capacitor, load | Reservoir capacitor reduces ripple; compare with/without C. |
| 17 | Zener shunt regulator | DC source, resistor, Zener, load | Clamp remains near rated Zener voltage; test safe current range. |
| 18 | TVS surge clamp | pulse source, TVS, load | Load peak stays below clamp limit; test pulse and dissipation warning. |
| 19 | NTC temperature divider | NTC, resistor, source | Output changes monotonically with temperature; test 0/25/60 °C. |
| 20 | LDR night light | LDR divider, comparator, LED | Light state changes at set threshold; test light-level sweep. |
| 21 | 555 astable blinker | NE555, R, C, LED | Oscillation frequency/duty match calculation; test waveform periods. |
| 22 | 555 monostable | NE555, trigger switch, R, C | One output pulse per trigger; test pulse width tolerance. |
| 23 | 556 dual timer | NE556, two R/C networks | Two independent oscillations operate; test frequencies separately. |
| 24 | Op-amp non-inverting amplifier | op amp, feedback resistors | Gain matches 1 + Rf/Rg; test AC gain at midband. |
| 25 | Op-amp inverting amplifier | op amp, R input/feedback | Gain polarity and magnitude match design; test phase and gain. |
| 26 | Voltage follower | op amp | Output tracks input within model limitations; test sweep and saturation. |
| 27 | Comparator threshold | comparator, divider, LED | Output flips at defined threshold; test rising/falling input. |
| 28 | Schmitt trigger | comparator, positive feedback | Separate thresholds show hysteresis; test both transition levels. |
| 29 | Window comparator | dual comparator, divider | Indicator is active only within window; test three voltage regions. |
| 30 | Precision reference buffer | reference, op amp, load | Buffered output is stable under stated load; test load sweep. |
| 31 | Transistor common-emitter amp | NPN, bias network, coupling capacitors | Inverted voltage gain occurs without clipping; test bias point and sine trace. |
| 32 | Emitter follower | NPN, load | Output follows input about VBE lower; test DC sweep. |
| 33 | MOSFET low-side switch | logic MOSFET, load, flyback diode | Load switches with valid gate drive; test off/on VDS and coil turn-off. |
| 34 | P-MOS high-side switch | P-MOS, gate network, load | Load gets supply when enabled; test gate/source limits. |
| 35 | Relay driver | NPN, relay, flyback diode | Relay energizes without excessive transistor voltage; test coil current and release transient. |
| 36 | H-bridge DC motor driver | H-bridge, motor model | Direction reverses safely; test both states and shoot-through interlock. |
| 37 | Audio preamp | electret mic, bias, op amp | Small input is amplified in band; test gain and bias. |
| 38 | LM386-class audio amp | audio amp, speaker model | Audio source drives output without clipping at target level; test THD/model warning. |
| 39 | Active low-pass filter | op amp, R/C | Response meets designed cutoff/order; test Bode sample points. |
| 40 | Wien bridge oscillator | op amp, RC bridge | Stable sinusoid begins under model conditions; test frequency and amplitude limit. |
| 41 | AND gate truth table | 74xx AND, switches, LEDs | All four input cases match truth table; automated vector test. |
| 42 | OR gate truth table | 74xx OR, switches, LEDs | All four cases match truth table; automated vector test. |
| 43 | XOR parity checker | XOR gates, switches, LED | LED flags odd parity; test all input combinations. |
| 44 | SR latch | NOR/NAND latch, switches | Set/reset/hold behavior is correct; test prohibited input warning. |
| 45 | D flip-flop register | D FF, clock, data switches | Q samples D at active clock; test setup/hold annotations. |
| 46 | JK toggle divider | JK FF, clock source | Q frequency is half clock in toggle mode; test edge count. |
| 47 | Four-bit binary counter | counter IC, clock, LEDs | Counts 0–15 then wraps; test 16 clock vectors. |
| 48 | BCD counter display | decade counter, 7-seg decoder | Display cycles 0–9; test reset/wrap. |
| 49 | Traffic-light FSM | gates/FFs, LEDs, clock | Legal light sequence repeats; test no conflicting green state. |
| 50 | Debounced digital input | button, RC/Schmitt trigger | One logical edge per press; test bounce waveform. |
| 51 | Shift-register LED chaser | serial shift register, clock, LEDs | Single bit moves per clock; test state sequence. |
| 52 | Multiplexer selector | 4:1 mux, switches, LED | Output equals selected input; test all select vectors. |
| 53 | Decoder-controlled LEDs | 2:4 decoder, switches | Exactly one output active; test all addresses. |
| 54 | Priority encoder | encoder, switches | Highest-priority asserted input encodes; test multiple inputs. |
| 55 | ALU add/subtract | adders, XOR controls | Correct sum/difference and carry; test vector suite. |
| 56 | UART transmitter model | MCU/digital source, UART monitor | Frame start/data/stop timing correct; test decoded bytes. |
| 57 | UART receiver model | serial source, MCU/digital logic | Valid frame decodes, framing error flags; test valid/invalid frames. |
| 58 | I²C sensor bus | MCU model, I²C sensor, pull-ups | Address/read transaction succeeds; test ACK/NACK. |
| 59 | SPI display bus | MCU model, SPI display | Bytes reach display model in mode 0; test timing/CS sequence. |
| 60 | EEPROM data logger logic | MCU model, serial EEPROM | Write/read preserves sample data; test power-cycle persistence model. |
| 61 | Arduino blink | Uno-class MCU, LED, resistor | Firmware toggles LED at configured interval; test simulated GPIO trace. |
| 62 | Arduino button debounce | Uno-class MCU, button, LED | One state toggle per debounced press; test bounce input. |
| 63 | Arduino PWM dimmer | Uno-class MCU, pot, MOSFET, LED | ADC maps to PWM duty; test min/mid/max. |
| 64 | Arduino temperature monitor | Uno-class MCU, temperature sensor, LCD | LCD shows valid converted value; test three sensor values. |
| 65 | Arduino ultrasonic ranger | Uno-class MCU, ultrasonic sensor, OLED | Range value updates for supplied echo times; test boundaries. |
| 66 | Arduino servo control | Uno-class MCU, pot, servo | Servo command sweeps 0–180°; test PWM width. |
| 67 | Arduino stepper driver | Uno-class MCU, driver, stepper | Steps/direction produce expected motion model; test sequence. |
| 68 | ESP32 Wi-Fi telemetry mock | ESP32-class MCU, temp sensor | Encoded telemetry payload forms correctly; test offline simulated transport. |
| 69 | Pico ADC voltmeter | Pico-class MCU, divider, OLED | Displayed voltage matches calibrated input; test calibration points. |
| 70 | STM32 timer PWM | STM32-class MCU, LED/load | Timer output frequency/duty meet configuration; test waveform. |
| 71 | PIC ADC bargraph | PIC MCU, potentiometer, LED bar | ADC threshold drives bar count; test input sweep. |
| 72 | AVR IR receiver | AVR MCU, IR receiver | Known NEC-like code decodes; test timing vectors. |
| 73 | Microcontroller watchdog | MCU, watchdog model, LED | Failed service resets controller state; test induced stall. |
| 74 | CAN node pair | two MCU models, CAN transceivers | Valid frame passes and ACKs; test bus termination state. |
| 75 | RS-485 sensor network | MCU, transceivers, sensors | Addressed polling returns only intended node; test collision avoidance. |
| 76 | GPS display interface | MCU, GNSS model, LCD | Valid NMEA sentence parses; test checksum failure. |
| 77 | RFID access reader | MCU, RFID module, servo/LED | Allowlisted tag opens simulated lock; test unknown tag rejection. |
| 78 | NFC tag reader | MCU, NFC module, OLED | UID is displayed safely; test read error. |
| 79 | Data logger to EEPROM | MCU, sensor, EEPROM | Periodic samples persist/replay; test full buffer wrap. |
| 80 | Low-power sleep/wake | MCU, interrupt switch, LED | Sleep current model/status and interrupt wake are correct; test wake edge. |
| 81 | BLE beacon configuration | BLE module, MCU | Advertising payload is formed from settings; test field encoding. |
| 82 | LoRa sensor node | LoRa module, temp sensor, MCU | Payload and duty-cycle guard are correct; test send schedule. |
| 83 | GSM alarm notifier mock | LTE/GSM modem, MCU, sensor | Alert command sequence is valid; test modem error handling. |
| 84 | Wi-Fi relay controller | Wi-Fi MCU, relay driver | Valid local command changes relay; test authentication placeholder/offline fail safe. |
| 85 | Ethernet sensor node | Ethernet PHY, MCU, sensor | Link/configuration state transitions are visible; test packet framing mock. |
| 86 | IR remote decoder | IR receiver, MCU, display | Remote key code selects action; test invalid pulse rejection. |
| 87 | FM radio front-end concept | antenna, RF/tuning blocks, audio amp | Tuned response peaks at set frequency; test model-limited Bode response. |
| 88 | RFID inventory concept | RFID reader, tag models | Identifiers are enumerated by test scenario; test duplicate/read collision response. |
| 89 | I²C bus level shifter | two voltage rails, bidirectional shifter | Both sides communicate without overvoltage; test high/low transitions. |
| 90 | USB-UART console | USB-UART bridge, MCU | Text transmits/receives at set baud; test known byte stream. |
| 91 | Electret microphone meter | mic preamp, rectifier, LED bar | Bar level follows input amplitude; test calibrated sine levels. |
| 92 | Audio tone generator | oscillator, amp, speaker | Frequency is within design tolerance; test spectrum/zero crossings. |
| 93 | Guitar pedal buffer | JFET/op-amp buffer | Input impedance high, unity gain in band; test AC response. |
| 94 | Simple mixer | two sources, summing op amp | Output equals weighted sum without clipping; test source combinations. |
| 95 | PWM audio DAC concept | PWM source, low-pass, load | Filtered output tracks duty average; test ripple limit. |
| 96 | Digital volume control | digital pot, audio source | Gain follows command steps; test monotonic response. |
| 97 | Colour LED controller | RGB LED, MCU/PWM | Requested RGB values produce correct channel duty; test colour vectors. |
| 98 | OLED status panel | MCU, OLED, sensors | Values update and bounds are handled; test missing-sensor message. |
| 99 | E-paper display updater | MCU, e-paper model | Partial/full refresh request meets state sequence; test power-state handling. |
| 100 | Seven-segment clock | RTC, MCU, display | Time increments and rollover works; test 23:59:59. |
| 101 | Buck converter baseline | switch, diode/synchronous model, L/C, controller | Output regulates at setpoint; test line/load steps. |
| 102 | Boost converter baseline | inductor, switch, diode, C, controller | Output exceeds input under valid load; test duty limit. |
| 103 | Buck-boost supply | controller, L/C, source/load | Output regulates above/below input; test crossover. |
| 104 | Li-ion charger concept | charger IC model, cell | Charge phases respect model limits; test no-cell/fault state. |
| 105 | BMS cell monitor | cell stack, monitor, balancing loads | Flags over/under-voltage; test each threshold. |
| 106 | Solar MPPT concept | solar source, converter/controller | Operating point moves near configured maximum; test irradiance sweep. |
| 107 | USB-C sink concept | USB-C connector, PD controller, load | Negotiation state follows approved profile model; test fallback 5 V. |
| 108 | USB-C source concept | PD source controller, load model | Advertised profile constraints are respected; test overcurrent response. |
| 109 | PoE powered-device input | RJ45/PoE model, rectifier, DC/DC | Correct polarity bridge/power path; test alternative feed states. |
| 110 | Constant-current LED driver | driver, LED string, sense resistor | Current remains regulated across load range; test open LED warning. |
| 111 | MOSFET half-bridge | high/low MOSFETs, driver | Complementary gates include dead time; test no overlap. |
| 112 | IGBT inverter leg | IGBT pair, driver, load | Switching state respects gate logic; test fault interlock. |
| 113 | TRIAC AC dimmer concept | AC source, optotriac, triac, lamp | Phase angle changes RMS load model; test zero-cross sync. |
| 114 | SSR AC load switch | opto/SSR, AC load | Load state follows isolated control; test off leakage model. |
| 115 | Battery-powered UPS | charger, battery, ideal diode, load | Transfer maintains output within hold-up window; test mains loss. |
| 116 | Inverter waveform concept | DC bus, H-bridge, PWM filter | Output waveform meets chosen model target; test RMS/frequency. |
| 117 | Electronic load | MOSFET, op amp, shunt | Draws commanded current within tolerance; test current steps. |
| 118 | Hot-swap input protection | hot-swap controller, MOSFET, load C | Inrush limiting operates; test overload trip. |
| 119 | Reverse-polarity protection | ideal-diode/MOSFET circuit | Correct polarity powers load; reverse polarity blocks; test both. |
| 120 | Surge-protected input | fuse, MOV/TVS, filter | Surge clamp/fuse warning occur as modeled; test transient. |
| 121 | Single-sided LED PCB | LED circuit, through-hole/SMD footprints | ERC/DRC clean; export Gerber/drill/BOM and compare expected files. |
| 122 | 555 timer PCB | NE555 circuit, DIP footprint | Schematic-to-PCB mapping complete; test no un-routed nets. |
| 123 | Op-amp filter PCB | active filter, SOIC/headers | Design rules and footprint pins match; test netlist equivalence. |
| 124 | Arduino shield | headers, sensors, LEDs | Board mates with declared header map; test keep-outs and DRC. |
| 125 | USB-C breakout | USB-C connector, CC resistors | Footprint/pin map verified; test DRC and connector pin report. |
| 126 | Sensor breakout board | sensor, regulator, I²C header | BOM/placement export contains all parts; test ERC/DRC. |
| 127 | Relay module PCB | relay, transistor, diode, terminal blocks | Clearance/net class rules pass; test coil/load isolation annotations. |
| 128 | Audio amplifier PCB | amp IC, electrolytics, speaker terminal | Grounding/routing review checklist passes; test DRC and BOM. |
| 129 | Buck converter PCB | switcher, inductor, diode, caps | High-current net rules assigned; test DRC and layout checklist. |
| 130 | Four-layer MCU board plan | MCU, decouplers, connector | Stack-up/return-path rules documented; test no missing power pins. |
| 131 | Differential pair demo | USB/data connector, transceiver | Pair constraint report exists; test only if engine supports rules, otherwise blocking limitation. |
| 132 | QFN footprint validation | QFN IC, exposed pad | Pad map and stencil/courtyard data validate; test footprint checker. |
| 133 | BGA escape concept | BGA, vias, board | Reports capability/limitations truthfully; test no false manufacturability claim. |
| 134 | Panel-mount controller | PCB, terminal blocks, mounting holes | Mechanical holes/cut-outs documented; test dimensions/DRC. |
| 135 | Test-point rich board | MCU board, test pads | Required nets have accessible test points; test net coverage report. |
| 136 | Manufacturing export pack | completed simple PCB | Gerber, drill, BOM, placement, PDF files generated and checksum-listed. |
| 137 | Assembly variant board | optional LEDs/sensors, variants | Variant BOM excludes DNP correctly; test two generated BOMs. |
| 138 | Net-class rule demo | power/signal nets | Width/clearance violations are found; test deliberate violation fixture. |
| 139 | Copper zone demo | ground plane, thermal reliefs | Zone connects permitted pads only; test refill/DRC. |
| 140 | PCB-to-schematic reconciliation | edited footprint/net | Reconciliation item appears and needs choice; test no silent source change. |
| 141 | DC voltmeter use | source, divider, meter | Instrument reports expected voltage/units; test known references. |
| 142 | DC ammeter use | source, resistor, meter | Series current matches Ohm’s law; test placement error detection. |
| 143 | Oscilloscope trigger | pulse source, scope | Trigger locks at configured edge/level; test trace metadata. |
| 144 | Two-channel phase measurement | sine sources, scope | Reports phase offset within tolerance; test 90° input. |
| 145 | Logic analyser capture | digital counter, analyser | Captures labelled channels/states; test decoded count sequence. |
| 146 | Frequency counter | oscillator, counter | Frequency reading matches period; test multiple frequencies. |
| 147 | Bode plot of RC filter | RC network, AC analysis | Plot includes magnitude/phase/unit labels; test cutoff marker. |
| 148 | Transient pulse response | RLC network, pulse | Damping/ringing shown; test stable timestep warning. |
| 149 | Parameter sweep | resistor range, LED/amp | Results track parameter values; test three points. |
| 150 | Monte Carlo tolerance plan | resistor/cap tolerance model | Runs only if implemented; test seeded repeatability and report distribution. |
| 151 | Thermal warning boundary | power resistor, load | Warns that no thermal model/certification is implied unless implemented; test message. |
| 152 | Convergence failure study | intentionally difficult SPICE circuit | Error is specific/actionable; test no fabricated result. |
| 153 | Floating-node diagnosis | invalid analog circuit | ERC/simulation identifies floating node; test jump-to-object. |
| 154 | Short-circuit diagnosis | supply short fixture | Reports error before run; test safe blocking. |
| 155 | Missing-ground diagnosis | source/load no reference | Run is blocked/explained; test rule ID. |
| 156 | Model-unavailable diagnosis | schematic-only component | UI marks unavailable, does not run fake model; test status. |
| 157 | Net probe cross-probe | schematic/PCB/breadboard circuit | Selecting net highlights same ID in all views; test assertion. |
| 158 | Component property audit | resistor/footprint/model | Inspector edits valid value and validates invalid range; test undo/redo. |
| 159 | Simulation report export | known RC circuit | Report carries settings, model/version, result and warnings; test required fields. |
| 160 | Reproducible run lockfile | known circuit/library lock | Same lockfile produces same expected model selection; test manifest compare. |
| 161 | PLC start/stop motor concept | generic PLC, start/stop, relay/motor model | Seal-in logic operates; test stop/emergency break condition. |
| 162 | PLC traffic light | generic PLC I/O, lamps, timers | Safe timed sequence repeats; test timing state table. |
| 163 | Tank level controller | PLC, level sensors, pump | Pump follows low/high hysteresis; test simulated levels. |
| 164 | Conveyor counter | PLC, photoeye, motor | Counts objects and stops at target; test event sequence. |
| 165 | Star-delta starter concept | contactors, timer, motor model | Interlocks prevent overlap; test all transition states. |
| 166 | Forward/reverse motor concept | contactors, buttons, motor | Electrical interlock prevents simultaneous drive; test conflict request. |
| 167 | Emergency-stop safety concept | E-stop, safety relay, load | Unsafe reset is rejected in model; test E-stop/restart sequence. |
| 168 | Door interlock concept | limit switch, relay, indicator | Load enabled only with closed guard; test open guard. |
| 169 | Temperature alarm | sensor, comparator/PLC, buzzer | Alarm trips/latches at threshold; test reset policy. |
| 170 | Water leak alarm | moisture sensor, buzzer/relay | Alarm triggers under wet stimulus; test dry recovery. |
| 171 | Fan thermostat | NTC, controller, fan | Fan switches with hysteresis; test temperature sweep. |
| 172 | PWM fan controller | MCU/driver, fan | Duty tracks temperature curve; test curve knots. |
| 173 | Automatic night light | LDR, controller, LED | Light responds to lux threshold; test day/night. |
| 174 | Smart irrigation model | moisture sensor, pump/valve | Waters only when dry and permitted; test sensor fault. |
| 175 | Garage-door concept | limit switches, motor relay | Open/close stops at limits; test conflicting commands. |
| 176 | Elevator call logic concept | buttons, indicators, controller | Deterministic state model meets request queue; test scenario table. |
| 177 | Fire-alarm zone concept | detectors, panel/buzzer | Zone alarm and fault distinguish; test open/short inputs. |
| 178 | Access-control strike lock | RFID, controller, lock relay | Allowlist opens strike briefly; test audit event mock. |
| 179 | Warehouse beacon concept | sensor, LEDs/buzzer | Status indication follows occupancy state; test state transitions. |
| 180 | Machine fault annunciator | inputs, lamps/buzzer, acknowledge | Fault latches until acknowledged and cleared; test sequence. |
| 181 | Breadboard-to-schematic sync | LED circuit in breadboard and schematic | Net/component IDs remain identical after valid breadboard wiring; test structural diff. |
| 182 | Schematic-to-PCB sync | 555 circuit schematic and PCB | Footprints/netlist transfer without loss; test pin/pad map. |
| 183 | Three-view LED project | LED circuit in all views | One component edit propagates/reconciles correctly; test history/undo. |
| 184 | Unsupported breadboard package | BGA/board-only part | System creates reconciliation item; test no bogus breadboard placement. |
| 185 | Missing-footprint workflow | valid schematic-only part | PCB update blocks and offers resolution; test required report. |
| 186 | Pin-incompatible substitution | two similar but incompatible parts | Substitution is blocked/previewed; test unchanged original after cancel. |
| 187 | Unit conversion calculator | resistor/power/length values | Correct SI conversions/rounding; test known inputs. |
| 188 | Resistor colour-code reader | resistor values/tolerance | Displays valid bands and rejects invalid combination; test vectors. |
| 189 | LED resistor calculator | source, LED Vf/current | Recommends/calculates resistor with power warning; test reference cases. |
| 190 | Voltage-divider calculator | Vin/R1/R2 | Computes output/loading warning; test analytical values. |
| 191 | RC timing calculator | R/C | Computes tau/cutoff; test decimal prefixes. |
| 192 | Op-amp gain calculator | resistor values | Computes inverting/non-inverting gain; test zero/invalid safeguards. |
| 193 | PCB trace-width assistant | current/copper/rise input | Produces advisory with standards/source limitation; test input validation. |
| 194 | BOM export and costing placeholder | project BOM | Exports verified BOM fields without fabricated prices; test no price when source absent. |
| 195 | Adigun BOT explain component | verified resistor/LED record | BOT cites project/library fields and admits unknowns; test grounded response fixture. |
| 196 | Adigun BOT diagnose error | floating-node project | BOT proposes validated repair preview, not direct edit; test confirmation gate. |
| 197 | Adigun BOT circuit proposal | 12 V LED request | Produces schema-valid preview with calculated resistor assumptions; test user rejection leaves project unchanged. |
| 198 | Four-language UI sweep | representative project | All four locales show no missing IDs/overflow; automated visual/a11y test. |
| 199 | Local offline recovery | edited project, simulated storage interruption | Unsaved recovery/export guidance works; test no silent loss. |
| 200 | Release candidate end-to-end | example 1/122/182/195 mix | Build, import, edit, simulate, ERC/DRC, export and BOT-preview evidence all pass in CI. |

---

## 13. Quality, accessibility, security, and release gates

### 13.1 Test layers

| Layer | Minimum evidence |
|---|---|
| Schema/domain unit tests | IDs, migrations, pin/pad maps, net invariants, sync/reconciliation, imports/exports |
| Simulation reference tests | Known circuits, analysis settings, tolerances, convergence/failure paths, no-result-on-failure checks |
| Component tests | Each verified part record and model status; sampled/required model fixtures; manifest coverage |
| Editor integration tests | Breadboard topology, schematic ERC, PCB DRC, cross-probe, undo/redo, autosave/recovery |
| UI/e2e tests | Every enabled menu/toolbar/button, keyboard path, responsive layouts, no overlap/overflow, file workflows |
| Accessibility tests | Automated scan plus keyboard, focus, screen-reader labels, zoom/reflow, contrast, reduced motion |
| Localization tests | All locales complete; no English leak/missing message ID; plural/overflow/layout assertions |
| Security tests | Dependency audit, secret scan, CSP/input validation, model sandbox, auth/RLS tests if cloud approved |
| Performance tests | Large project, library search, split-view rendering, cancellation, memory/time budgets |
| Human engineering review | Model provenance, component evidence, example-project results, limitations and release notes |

### 13.2 Required quality rules

- No test suite may replace real engineering validation with snapshots alone.
- No visual state may present a simulated result as measured hardware data.
- No enabled command may lack implementation and action/e2e coverage.
- Treat warnings/errors as structured data; no error swallowing or console-only failure.
- Add regression fixtures for each fixed issue involving connectivity, pin mapping, calculation, routing rule, localization, accessibility, or destructive data operation.
- Use dependency pinning, review licences, generate SBOM, and run vulnerability/license checks.
- Preserve design data in failed/partial imports and provide an export/backup route before migrations or destructive conversions.

### 13.3 Release evidence pack

Each release candidate must contain: versioned changelog; architecture/ADR list; test summary with failures; coverage report; 1,000-part evidence coverage report; 200-example result matrix; model/license ledger; known limitations; accessibility report; localization completeness report; security/dependency report; performance report; screenshots/video of representative flows; and signed approval record. A green build never permits a claim of “zero bugs”; state the actual evidence and unresolved risk.

---

## 14. Staged delivery and approval gates

| Phase | Deliverables | Exit criteria | Approval required before next stage |
|---|---|---|---|
| 0 — Discovery | Repository inventory, design-reference inventory, risk register, ADR backlog, this approved specification | No invented baseline; decisions/unknowns recorded | Product/spec approval |
| 1 — Foundation | Repo setup, architecture, native schema, design-token adapter, localization skeleton, CI/test harness, read-only mockup-aligned shell | Build, schema, a11y baseline, responsive shell and no dead controls pass | Architecture/UI approval |
| 2 — Circuit core | Canonical Circuit Document, project storage/import/export, command/undo system, schematic editor + ERC | Schema/sync/history fixtures pass | Engineering-core approval |
| 3 — Breadboard | Board topology engine, placement/wiring, validation, schematic mapping/reconciliation | Breadboard fixtures and cross-view tests pass | Breadboard UX approval |
| 4 — PCB baseline | Footprints, board/routing/DRC, manufacturing exports, schematic synchronization | Pin/pad/DRC/export fixtures pass | PCB workflow approval |
| 5 — Simulation | Engine selection/license decision, worker adapter, analog/digital baseline, instruments and result reports | Reference circuits pass; failures are truthful | Simulation validation approval |
| 6 — Library | Evidence pipeline, 565 taxonomy mapping, staged real parts toward 1,000, symbol/footprint/model tests | Manifest and evidence gate reaches agreed milestone | Component-library release approval |
| 7 — Examples/docs | 200 project files, tutorials, test harnesses, documentation and limitations | Per-example result matrix complete | Content/engineering review |
| 8 — BOT | Grounded retrieval, structured proposals, preview/confirmation/undo/audit flows | Red-team/misuse/confirmation tests pass | AI/privacy/security approval |
| 9 — Optional cloud/auth | Only if separately approved: dedicated backend, account/data policies, sync/sharing | Security, privacy and e2e evidence pass | Infrastructure/budget/deployment approval |
| 10 — Release candidate | Full QA, accessibility, localization, performance, docs, release evidence pack | All blocking gates pass and known issues accepted | Explicit production deployment approval |

At each phase, report exactly: **Done** (implemented and evidenced), **Tested** (commands/results), **Not done/risks**, and **Next** (one concrete action). Do not compress planned, implemented, and tested into one status claim.

### 14.1 Deployment recommendation, subject to approval

Because the confirmed target repository is empty, no current frontend/backend stack or hosting integration can be inferred. For the proposed local-first browser application, static application assets can be hosted by a static host such as Cloudflare Pages or GitHub Pages after a build and route strategy are approved. GitHub Pages is suitable only for the static client and public documentation; it cannot safely host server-side secrets, authenticated APIs, BOT orchestration, or privileged model execution.

If the optional BOT, authentication, cloud project storage, or synchronization phase is approved, deploy those functions separately in a secure server-side environment (for example, a scoped Worker/service plus a dedicated approved data provider). Keep all secrets in host-managed protected settings; never commit them, place them in browser bundles, or store them in project files. Create a separate deployment configuration, preview environment, domain/redirect allowlist and CI release gate for AdigunSimulator. Do not assume a public hostname, overwrite another product, create a provider account/project, or deploy anything without an explicit release/infrastructure approval.

---

## 15. Initial technical decisions to approve before implementation

1. Confirm the target as a browser-based local-first application, with a modular TypeScript architecture and a worker-isolated simulator. Select exact framework/build/test libraries only after repository bootstrap decision.
2. Confirm whether the first usable release is schematic-first or must ship Breadboard, Schematic, and PCB baselines together. The mockup supports all three but they must not be presented as finished ahead of evidence.
3. Approve a part-data/model licensing policy and the specific authoritative distributors/manufacturers permitted for the 1,000-part evidence ledger.
4. Approve the initial PCB exchange/manufacturing formats and scope; Gerber X2/Excellon/BOM/placement are the recommended baseline.
5. Approve the simulator engine only after legal/technical evaluation; do not embed an unreviewed SPICE engine.
6. Confirm local-only base scope versus optional dedicated cloud authentication/synchronization. No reuse of unrelated product infrastructure.
7. Approve the BOT provider, data boundary, privacy terms, server-side secret handling and per-operation confirmation policy before enabling it.
8. Confirm the product’s initial supported electrical ranges and explicit exclusions for mains/high-energy/radio/thermal domains.

---

## 16. Definition of done for the approved initial release

The initial release is done only when the approved scope has all enabled features implemented, documented, translated, accessible, and tested; the Circuit Document safely survives create/edit/save/open/import/export; each supported view has verified synchronization/reconciliation; simulation results are attributable and truthfully limited; all listed enabled controls work; the shipped component count has evidence; every released example has a recorded result; and release evidence receives explicit product approval. There must be no repository modification, cloud resource creation, or deployment until the corresponding approval is given.

