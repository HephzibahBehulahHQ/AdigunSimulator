# TI SN74HC138N evidence

- Exact orderable: [TI SN74HC138N product page](https://www.ti.com/product/SN74HC138/part-details/SN74HC138N) listed active status, PDIP-16 package and -40 °C to +85 °C range; inventory showed out of stock when checked on 2026-11-03.
- Function and electrical ratings: [SNx4HC138 Rev. G datasheet](https://www.ti.com/lit/ds/symlink/sn74hc138.pdf), document SCLS107G, revised October 2021. TI lists a 2 V to 6 V supply range and an active-low selected output. The part has address inputs A/B/C, active-low enables G2A/G2B, active-high enable G1, eight outputs, VCC and GND.
- PDIP pin map from the datasheet's 16-pin package pin-function table: 1 A, 2 B, 3 C, 4 G2A_N, 5 G2B_N, 6 G1, 7 Y7_N, 8 GND, 9 Y6_N, 10 Y5_N, 11 Y4_N, 12 Y3_N, 13 Y2_N, 14 Y1_N, 15 Y0_N, 16 VCC. Pin 1–6 are inputs, pin 7 and 9–15 are outputs, and pins 8/16 are ground/supply.
- PDIP-16 package outline: the datasheet's TI N package drawing 4040049/E gives body length 18.92–19.69 mm and body width 6.10–6.60 mm. The footprint keeps the conventional 2.54 mm lead pitch and 7.62 mm row spacing; its pad/drill sizes are CC0 educational defaults and are not a TI-approved land pattern.
- Datasheet checksum: 1,989,229 bytes; SHA-256 `795ac76468c240b976a632b6107738765800f7f672ad5b58925fbfb5f5064938`, recorded in `library/evidence/datasheet-checksums-2026-11-03.md`.
- Simulation: not modelled. The current digital event engine does not implement the decoder's truth table or its propagation delay, thresholds, output drive, loading, or supply current. This record cannot be inserted as a simulated component.
- Original generic pin-map symbol and educational PDIP footprint are CC0 1.0. They are not TI artwork, an approved manufacturing land pattern, or manufacturing approval.

This remains an unverified candidate and does not count toward the 1,000 verified-part target. Independent electrical and physical review is still required.
