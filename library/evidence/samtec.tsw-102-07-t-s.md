# TSW-102-07-T-S

[Samtec product specification and drawings](https://www.samtec.com/products/tsw-102-07-t-s) identify the exact 2-position tin-plated single-row header and 2.54 mm pitch. Pin labels are passive positional identifiers. [Native example](../../examples/068-esp32-telemetry-mock.adigun.json) supplies the educational pad/drill evidence. Independent review is pending.

Native placement preserves the numbered schematic terminals and 2.54 mm PCB pad centers. The catalogue footprint uses the 1.02 mm nominal hole from the [Samtec recommended TSW layout](https://suddendocs.samtec.com/prints/tsw-xxx-xx-x-x-xx-xxx-footprint.pdf). That hole clears the nominal 0.635 mm square post diagonal. The 1.8 mm copper diameter is an educational design choice. Example 068 also uses the 1.02 mm nominal hole for J1. Its educational PCB DRC and Excellon output are checked in the core tests. BB400 insertion depth and continuity still require a fit check.
