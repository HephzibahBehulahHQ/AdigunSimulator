# onsemi 2N3904BU footprint evidence

Footprint state: educational candidate; not approved for fabrication
Evidence checked: 2026-11-13

## Manufacturer evidence

- [onsemi 2N3904 datasheet Rev. 3](https://www.onsemi.com/download/data-sheet/pdf/2n3904-d.pdf)

The ordering table lists 2N3904BU as TO-92-3. The Case 135AN Issue O mechanical drawing shows the straight-lead TO-92 package and numbers leads 1, 2, 3; the datasheet identifies them as emitter, base, and collector. The drawing gives 2.54 mm from lead 1 to lead 3, so the adjacent pitch is 1.27 mm.

## Layout limits

The JSON maps pads 1, 2, and 3 to the corresponding numbered device leads in a single row. Pad diameter (1.8 mm) and drill (0.8 mm) are AdigunSimulator CC0 defaults; the datasheet does not publish these as a board land pattern. The asset has not passed independent physical fit review or manufacturing DRC.

Confirm lead forming and package orientation, finished-hole tolerance, annular ring, courtyard, and fabricator rules against the physical part before use. This candidate does not establish simulation support or a verified part status.
