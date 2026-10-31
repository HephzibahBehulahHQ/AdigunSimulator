# Example 121: Single-sided LED PCB

## Circuit and board

A 5 V source/terminal input drives a red LED through a 330 Ω series resistor. The project keeps one native netlist and provides three coordinated views. The PCB data describes a 40 × 24 mm, 1.6 mm board with one F.Cu layer, a through-hole two-pin input terminal and 0805 SMD resistor/LED footprints.

## Bounded checks and generated files

The project is checked for supported board bounds, single-layer routing, net-to-pad mapping, routed endpoints, pad-to-pad clearance and valid through-hole drill sizes. The electrical project validator and supported LED calculation are also exercised. The expected files are byte-compared in the project tests:

- `board-F_Cu.gbr`: copper pads and routed traces.
- `board-Edge_Cuts.gbr`: rectangular board outline.
- `board-PTH.drl`: plated through-hole drill coordinates.
- `BOM.csv`: reference, value, package and technology listing.

The BOM deliberately marks packages as generic; they are footprint descriptions and are not a verified supplier part list.

## Manufacturing limits

These generated files are an educational export preview. The bounded checks are not a substitute for a manufacturer-specific ERC/DRC, solder-mask/paste/silkscreen generation, annular-ring or trace-current review, assembly verification, or fabrication sign-off. Review the selected real parts, footprints, copper rules, drill tolerances, materials, and manufacturing outputs with the intended PCB manufacturer before ordering.
