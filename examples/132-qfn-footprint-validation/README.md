# 132 — QFN footprint validation

This footprint-only fixture uses the TI TPS62130RGTR in package RGT0016C. The bounded checker verifies the 16 lead numbers and names plus exposed pad 17, the declared 3.0 mm body and land geometry, sixteen lead stencil apertures, a four-window exposed-pad stencil proposal, and a 3.8 mm courtyard with 0.4 mm body margin.

The package pin map, outline, lead pitch/land pattern and exposed-pad callout come from the [TI TPS6213x datasheet](https://www.ti.com/lit/ds/symlink/tps62130.pdf). The split paste apertures and courtyard are explicit project proposals, not a TI-recommended stencil/courtyard drawing. The review is geometric metadata validation; it does not model paste transfer, solder-joint quality, voiding, thermal behavior, nearby-part clearance, assembly yield or manufacturing DRC. Do not treat the fixture as a production footprint sign-off.
