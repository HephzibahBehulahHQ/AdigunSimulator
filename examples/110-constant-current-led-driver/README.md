# Example 110 — Constant-current LED driver

## Objective
Estimate constant-current regulation from a sense reference and resistor, verify operation across a configurable LED-string forward-voltage range, and report an open LED or compliance limitation.

## Example values
12 V supply, 0.35 V sense reference, 1 Ω sense resistor, 9 V LED string, 1 V minimum compliance, 90% efficiency assumption. Expected LED current is 350 mA and LED power is 3.15 W.

## Acceptance cases
- LED forward voltage 8 V, 9 V, and 10.5 V: current remains 350 mA while compliance headroom is available.
- Open LED: result reports open-load warning and zero current.
- Excessive LED forward voltage: result reports compliance-limited current.
- Excessive sense-current request, output power, invalid limits, or broken wiring blocks the analysis.

## Boundaries and safety
Ideal average model only. Switching ripple, control-loop behavior, thermal design, tolerances, protection, device ratings, and hardware safety are not modeled.
