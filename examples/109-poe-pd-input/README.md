# Example 109 — PoE powered-device input concept

## Objective
Model an alternative feed state through a polarity-correcting bridge, check a bounded DC/DC input/output envelope, and estimate output power for a resistive load.

## Example values
48 V source fixture at 350 mA, 0.6 V per bridge diode, 37 V UVLO, 57 V maximum input, 12 V / 12 W converter, 90% assumed efficiency, and 24 Ω load. Expected output is 12 V, 0.5 A, 6 W; estimated post-bridge input is 46.8 V and required input power is 6.67 W.

## Acceptance cases
- Feed A and Feed B both produce the expected rectified polarity.
- Reversed feed polarity is corrected by the ideal full-wave bridge.
- A reduced DC/DC power budget disables the output when the load cannot be supplied.
- Unsupported feed mode/polarity and broken bridge, converter, or output wiring block analysis.

## Boundaries and safety
This is an ideal educational path estimate. It does not implement PoE detection, classification, negotiation, transformer isolation, protection, thermal behavior, IEEE compliance, or hardware safety. The illustrated feed labels do not define physical RJ45 terminal assignments. Verify exact hardware mappings and ratings before any real design.
