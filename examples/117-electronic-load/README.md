# Example 117 — Programmable electronic load

Models an ideal op-amp-controlled N-channel MOSFET sink with a 0.1 Ω shunt. The 12 V DUT supply is tested at 100 mA, 500 mA, and 1 A. The estimate reports shunt voltage and MOSFET dissipation for each steady-state command and checks configured current and power limits.

## Expected steps
- 100 mA command → 100 mA ideal estimate.
- 500 mA command → 500 mA ideal estimate.
- 1 A command → 1 A ideal estimate and 11.9 W MOSFET dissipation estimate.

Transient settling, loop stability, op-amp output swing, MOSFET safe operating area, thermal behavior, component tolerance, and hardware safety are not modeled. The step response is evaluated as a set of ideal steady states, not a real time-domain current waveform.
