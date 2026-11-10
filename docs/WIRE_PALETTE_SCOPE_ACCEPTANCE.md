# Wire appearance, project palette and floating oscilloscope

Checkpoint: 2026-11-10. These tools extend the existing menus; no new toolbar row.

| Milestone | Verifiable criterion | Evidence |
| --- | --- | --- |
| Wire editing | Select a schematic wire, edit color/area/AWG in Edit, retain native connectivity and history. | Native-document tests cover immutable edits, solver equivalence, route edits, split/join and file round trips. Browser AWG 18 produced 0.8230468337313146 mm²; exported file retained the annotations. |
| Project palette | Tools opens a named palette with component, wire, canvas and grid colors; Save changes the project, Cancel preserves it. | Browser custom orange wire/cyan symbol/dark background rendering and native download verified. Explicit wire colors override the palette. Four localized dialogs fit at 360 px without internal overflow. |
| Floating scope | Simulation opens a nonmodal scope confined to the visible canvas, with move, resize, minimize, close, probe and V/div controls. | Browser pointer drag/resize, keyboard movement/resize, minimize/restore and desktop/mobile containment passed. Actual pointer-handler tests cover capture, unrelated pointers, cancellation and boundary clamping. |
| Calculated waveform | Display existing solver data at the actual playback cursor; clear stale/unsupported data. | DC divider probe showed 4.909 V. RC transient paused at 0.2500 ms / 1.086 V; Step advanced to 0.2600 ms / 1.125 V; Stop cleared the trace. Tests compare scope points directly with solver samples. |
| Validation and release | Required local checks, exact-head CI, ordinary merge, Pages and canonical release verification. | 520 tests, syntax checks and library validation passed locally. Final commit, Actions and production evidence are recorded on the release PR. |

## Data and interaction rules

- Optional native `schematicWires[].appearance` contains `color`, `sizeMm2`, and `gaugeAwg`. Invalid colors, out-of-range values and contradictory AWG/area pairs are rejected on import. Editing area clears AWG; entering AWG derives area. Reset removes the override. Existing files need no migration.
- AWG 0–40 uses diameter `0.127 × 92^((36−AWG)/39)` mm and circular area. Reference: [Access Communications manufacturer AWG calculator](https://www.accesscomms.com.au/awg-calculator-by-diameter/). Size/gauge are annotations, not ampacity, voltage-drop or wire-resistance calculations. Visual stroke thickness is bounded for legibility and is not physical scale.
- Optional native `palette` stores a name and four six-digit hex colors. Native save/export and explicit reopen preserve it; startup remains empty. Component colors affect schematic symbol ink, preserving physical breadboard and PCB body colors. These controls do not change PCB copper dimensions or manufacturing rules.
- Both appearance mutations use the existing history/dirty path. The Edit form stays open while adjusting inputs/native color pickers; Apply/Reset or outside click dismiss it.
- The scope reads supported DC or linear RLC transient node voltages. DC is labeled as steady state. Transient playback uses existing calculated samples, with a bounded 2,000-sample trace. This is not a hardware oscilloscope or a new general-purpose time-domain solver. Unsupported models show an explanatory empty state, never a decorative waveform.
- A selected wire's net is the initial probe when available; otherwise an output/non-ground net is preferred. Probe selection, automatic/manual vertical scale and the actual time cursor stay inside the floating window. Pause/Step/Stop remain the existing simulation controls.
- Pointer and arrow-key move/resize are clamped beneath command bars and within the visible canvas/viewport. Minimize/Close keep the workspace usable. Offscreen/tiny canvas areas temporarily hide the scope. Closing/resetting a project clears the window. Page lifecycle cleanup removes controller listeners.

The broad master specification remains open, including the verified 1,000-part target. Library validation currently reports 15 candidates, 565 taxonomy types and zero verified parts; none were promoted by this change. Native print-preview inspection from the preceding menu release remains unverified and is outside this feature batch.
