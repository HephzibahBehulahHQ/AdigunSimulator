# 131 — USB Full-Speed differential pair demo

The demo links a USB-C USB 2.0 receptacle to a TI TUSB1106 Full-Speed transceiver and documents a 4-layer stack-up with a continuous GND reference. It records a nominal 90 Ω differential target, pair width/gap constraints, common routing layer, and a declared 0.1 mm D+/D− length mismatch.

The bounded report verifies only the stated pair-rule metadata and D+/D− connectivity. It can reject a missing or out-of-range width, gap, skew, reference plane, or pin mapping. This repository does not have a field solver or four-layer fabrication DRC, so 90 Ω is an unverified target; route lengths are declared inputs, not measured geometry.

**Not simulated or qualified:** USB enumeration/protocol, waveform/eye, jitter, insertion loss, crosstalk, EMC, actual differential impedance, production layout, or manufacturing.

Manufacturer sources: [TI TUSB1106 datasheet](https://www.ti.com/lit/ds/symlink/tusb1106.pdf), [TI USB layout basics](https://www.ti.com/video/6087491555001), and [TI TUSB1106 active product page](https://www.ti.com/product/TUSB1106/part-details/TUSB1106RGTR).
