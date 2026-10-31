# Example 119 — MOSFET reverse-polarity protection

Models an ideal reverse-polarity MOSFET protector between a 12 V DC source and a 100 Ω load.

## Expected behavior
- Correct polarity: the path conducts with a configured 0.4 V drop, leaving an 11.6 V output and 116 mA load current.
- Reversed polarity (−12 V source): the protector blocks the output and modeled load current is zero.

This bounded DC model omits body-diode details, gate-startup behavior, surge/transient stress, reverse recovery, thermal behavior, component tolerance, and hardware safety. It is not a verified product protection circuit.
