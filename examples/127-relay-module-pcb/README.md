# Example 127: Low-voltage relay module PCB

## Circuit and isolated domains

A 5 V control header drives an Omron G5V-1-DC5 SPDT relay through an NPN transistor and a 1N4007 flyback diode. The nominal G5V-1 DC5 coil is documented as 167 Ω / 30 mA. Control, coil and switched-contact nets have separate net classes; a 3.2 mm no-copper barrier separates the coil side from COM/NC/NO terminals. The test also verifies that the relay's five declared electrical pads map to the project's coil and contact pins.

The [Omron G5V-1 datasheet](https://omronfs.omron.com/en_US/ecb/products/pdf/en-g5v_1.pdf) lists a 1 A, 24 VDC resistive rated load and 1,000 VAC dielectric strength between coil and contacts. The [onsemi 1N4001–1N4007 datasheet](https://www.onsemi.com/download/data-sheet/pdf/1n4001-d.pdf) identifies the axial rectifier family and polarity band.

## Checks and expected exports

The project test checks the native pin/ERC subset, transistor base-drive estimate, flyback orientation, routed PCB, class trace widths, class clearances, the barrier, the isolation annotation, BOM and placement:

- `BOM.csv`
- `Placement.csv`
- `Relay-Isolation-Report.csv`
- `board-F_Cu.gbr`
- `board-Edge_Cuts.gbr`
- `board-PTH.drl`

## Limits

This is a low-voltage educational template, not a certified relay product. The G5V-1 package drawing shows mechanical and terminal arrangement; this repository's relay pad names and locations are a generic teaching template and must be checked against the exact manufacturer drawing/CAD before assembly. The 3.2 mm copper barrier is a project rule only; no creepage, clearance standard, pollution degree, altitude, working-voltage or system-level safety review is claimed. Do not switch mains, hazardous voltage, inductive or capacitive loads with this example. Relay bounce, arc suppression, load behavior, lifetime, electrical insulation testing, transistor thermal rise and PCB manufacturing constraints are not simulated.
