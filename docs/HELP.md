# AdigunSimulator Help

## Table of contents

- [Working with the design views](#working-with-the-design-views)
- [Running supported analyses](#running-supported-analyses)
- [The live co-pilot](#the-live-co-pilot)
- [Saving and undoing changes](#saving-and-undoing-changes)
- [Known limits](#known-limits)

## Working with the design views

Breadboard, schematic, and PCB views use one native project. A pin connection is stored once in the project's nets and appears in each supported view. A missing footprint or unsupported representation is reported instead of being fabricated.

In PCB view, focus a stored plated via and use the arrow keys to move it. With Snap on, each move is 0.5 mm; with Snap off, each move is 0.1 mm. Accepted moves use the same board, copper-clearance, and keep-out checks as the via editor and can be undone. A blocked move leaves the via unchanged. These controls do not establish manufacturing approval.

## Running supported analyses

Choose a supported analysis mode, review its configured inputs and stated model limits, then run it. Results come from the named bounded model. AdigunSimulator is not a general SPICE replacement and does not certify electrical safety or manufacturability.

## The live co-pilot

Adigun BOT's live co-pilot is a local, deterministic analyzer. It reads the current native-project components, library pin definitions, and net endpoints. It can point out an open input on supported two-input gates, an unconnected gate output that could be observed with a logic probe, unconnected VCC/GND pins on library parts that define those pins, multiple recognized gate outputs on one net, and parts that have remained entirely unwired for five seconds. It asks about the project goal when it cannot identify a clear path. Hovering over or selecting a component shows its current connected peers and open pins.

Use the **Live co-pilot** checkbox in the Adigun BOT panel to turn proactive checks on or off. Enter a goal or question in the panel and select **Ask**; a project goal is remembered for this browser session only. Checks are debounced, limited to one suggestion every 25 seconds, and paused while you type, drag, or run a simulation. Dismissed findings are suppressed temporarily.

For a supported suggestion, choose **Preview** to inspect the proposed change, then **Apply preview** to accept it. The Bot never changes the project before that confirmation. Applying a preview changes only the current working project; it is not auto-saved. Use **Undo** to roll it back, and use the normal save command only when you are ready. Stale or invalid previews are rejected without changing the project. Guests can use these local suggestions without signing in.

The Output panel records when a suggestion is dismissed, a preview is prepared or cancelled, an apply is blocked, or a reviewed preview is applied. These audit entries are local to the current browser session; they are not added to the project or uploaded.

Adigun BOT does not call an external AI service, infer real component ratings, decide an unknown supply voltage, or claim safety approval. The open gate-input preview connects one pushbutton terminal to the gate and deliberately leaves the other terminal open for the designer to wire to the intended source. The logic-probe preview only observes a net. For unsupported circuit intent, connect pins with the normal editor controls and run project validation.

You can also ask Adigun BOT how to start a project, run a supported analysis, use the parts panel, save or export, or change the interface language. It can switch directly to Breadboard, Schematic, or PCB view when asked to open or show that view. These answers use checked-in product guidance and disclose the current simulation, parts, and PCB limits; they do not call an external model or change circuit data.

For a manufacturer-part lookup, include an exact listed MPN or ledger ID. Adigun BOT returns recorded identity, package, lifecycle, evidence and simulation status, and source URLs; include “pin map” to request the ledger's numbered signal map. A candidate is not a verified part, and its ledger record does not prove simulator integration or model fidelity. Unmatched identifiers do not produce an invented manufacturer record.

## Saving and undoing changes

Project edits remain in the working copy until the user saves or exports them. Undo restores the previous project state. The Bot does not auto-save or upload project data.

Use **File → Export ideal SPICE netlist** to download a `.cir` file for projects containing only connected ideal DC voltage sources, resistors, capacitors, inductors, and a signal-ground reference. Unsupported components or invalid values block export. The file contains generic ideal element cards only; it has no analysis command, manufacturer device model, or simulation result. Run it separately in a compatible SPICE engine and review the model assumptions before relying on its output.

## Known limits

Supported simulations, component evidence, PCB checks, and exports are bounded by the implementation status and delivery gates in this repository. A generic symbol, candidate part, analytical example, or educational PCB check is not manufacturer verification or production certification.


