# 129 — 12 V to 5 V buck converter PCB

This educational board uses the TI LM2596T-5.0/NOPB fixed-output regulator, an onsemi 1N5822G Schottky catch diode, a generic 100 µH inductor, input/output capacitors, and 2-position input/output terminals. The copper classes declare 1.5 mm VIN/VOUT/GND tracks and a 1.0 mm switch-node track for a conservative 1 A layout-review envelope.

The fixture checks the regulator pin map and declared topology, bounded PCB DRC, power-layout checklist, BOM, placement, Gerber, and drill exports. The LM2596 output switch node is kept distinct from the fixed-output feedback net.

**Limitations:** this is not a switching simulation. It does not calculate regulation, ripple, efficiency, current limit, inductor saturation, thermal rise, EMC, or safe output current. Footprints and passive selections are illustrative templates. The sample has not been manufactured or independently qualified. Verify the exact purchased parts, capacitors, inductor saturation rating, thermal design, copper weight, trace geometry, connector ratings, and vendor layout guidance before construction.

Manufacturer references: [TI LM2596 datasheet](https://www.ti.com/lit/ds/symlink/lm2596.pdf) and [onsemi 1N5820/1/2 datasheet](https://www.onsemi.com/pdf/datasheet/1n5820-d.pdf).
