# Ladder instructions and canvas experience

## Delivered behavior

Draw now offers 65 native choices across eight groups, including 25 executable ladder instructions: two rails, Boolean input, NO/NC contacts, normal/negated/set/reset coils, TON/TOF/TP, rising/falling edge detectors, CTU/CTD/CTUD, SR/RS, and six comparisons. Search filters actual supported parts; each category renders at most 48 matches and requests a narrower search beyond that limit.

Components retain native identity, terminals, editable parameters, geometry and history. Ladder symbols use their own dimensions and concise labels. Connections propagate in topological order; tagged contact feedback uses the preceding scan's output image. Output tags commit together. A simultaneously asserted set/reset coil pair resets; inconsistent initial values are rejected.

Simulation records Boolean nets and tags, timer elapsed times and counter values. Pause/Step and the existing floating oscilloscope consume those calculated samples. Logic is labeled as logic, not volts/current. The scope's full-viewport dragging and existing 555/PWM signal repair remain intact.

Two connected projects are available in the existing Example menu:

- **Start/stop seal-in:** START at 100 ms; release at 200 ms; MOTOR remains set until STOP at 700 ms.
- **Timed pulse counter:** TON delays three edges by 30 ms; CTU reaches three and energizes DONE at 530 ms; RESET clears it at 800 ms.

Tools → Canvas experience controls optional ambient motion and a small tutorial companion. Tips point to existing Draw, Wire, Properties, Run and Oscilloscope controls. Showing Properties opens a collapsed panel. Preferences are local; they do not modify circuit data. No new toolbar row.

## Bounds and fidelity

These are executable logical instructions, not manufacturer PLC hardware models or certified IEC implementations. No mains, motor physics, physical coil current, contact bounce or safety-controller certification is modeled. They are schematic-only; unsupported PCB/breadboard mappings remain explicit.

Recordings permit 1–256 instructions, 512 nets, 2,000 samples, 60 seconds and 150,000 combined instruction/net sample operations. Input events are quantized to scan times. Physical wire feedback cycles and mixed analog/ladder circuits are rejected. Edge state starts false. Counters use a bounded 0–65535 integer range; CTUD simultaneous edges cancel and reset takes precedence over load. Comparisons use configured numeric parameters.

Animation uses CSS transforms, no additional rendering loop. It stops for reduced-motion preference, hidden documents and off-screen canvas. Turning off the companion removes its hit area. Controls and tutorial text cover English, German, Yoruba and Nigerian Pidgin; technical instruction names remain conventional.

The verified manufacturer-part count remains zero (15 candidates; 565 taxonomy types). This release does not claim the larger library or the newly requested million-example/SPICE target is complete; see EXAMPLE_BANK_SPICE_MILESTONES.md.

## Validation

- Automated tests cover every new instruction, native pin/symbol mapping, parameter edits/import validation, timing boundaries, counter edges, priorities, feedback, rejected models, playback/scope and both connected examples.
- Browser checks: Draw search/pen placement and selected properties; both example simulations and scope traces; logic terminal labels; tutorial toggling and reopening Properties; German settings; 390 px settings without horizontal overflow; reduced-motion preference suppressed animation; no console errors observed.
- Running-animation appearance on a device without reduced-motion preference was not verified; the test environment requests reduced motion.
- Required release checks and exact deployment commit are recorded in the pull request after execution.

## Primary behavior references

[CODESYS TON](https://content.helpme-codesys.com/en/libs/Standard/Current/Timer/TON.html), [TOF](https://content.helpme-codesys.com/en/libs/Standard/Current/Timer/TOF.html), [TP](https://content.helpme-codesys.com/en/libs/Standard/Current/Timer/TP.html), [CTU](https://content.helpme-codesys.com/en/libs/Standard/Current/Counter/CTU.html), [CTD](https://content.helpme-codesys.com/en/libs/Standard/Current/Counter/CTD.html), [CTUD](https://content.helpme-codesys.com/en/libs/Standard/Current/Counter/CTUD.html), and [SR](https://content.helpme-codesys.com/en/libs/Standard/Current/Bistable-Function-Blocks/SR.html). These establish functional expectations, not vendor compatibility or certification.
