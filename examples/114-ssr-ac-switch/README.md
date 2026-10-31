# Example 114 — SSR AC load switch

Models a 120 V RMS, 60 Hz AC input, an isolated control command, an ideal solid-state relay, and a 1 kΩ resistive load.

## Expected behavior
- Control off with 2 mA configured leakage produces a 2 V RMS estimate across the load.
- Control on produces a 118.5 V RMS estimate after the modeled 1.5 V relay drop.
- `stuck-open` preserves the off-leakage estimate despite an on command.
- `stuck-on` keeps the resistive load energized despite an off command.

The isolation flag describes a model assumption only. AC switching waveforms, real SSR leakage curves, surge/current ratings, optocoupler dielectric strength, creepage/clearance, snubbers, thermal behavior, mains protection, compliance, and hardware safety are not modeled. The AC voltage is conceptual and must not be treated as a mains construction guide.
