# Example 200 — Release-candidate end-to-end

## Objective
Run a release-candidate workflow across four released projects: LED current limiter (001), 555 timer PCB (122), schematic-to-PCB synchronization (182), and grounded Adigun BOT explanation (195).

## Automated gates
The suite builds and validates blank and starter projects; imports all four native files; edits the 001 series resistor and runs the supported LED analysis; checks project validation on all samples; runs PCB fabrication checks and exports the bounded PCB files for 122; round-trips native project exports; verifies the 182 net-to-pad mapping; and confirms 195 BOT evidence cites local project/library fields without mutating the project.

## Limits
The 555 PCB export is illustrative, not fabrication approval. The BOT result is a local field-grounded explanation, not external AI verification. CI does not deploy the site or certify physical hardware.
