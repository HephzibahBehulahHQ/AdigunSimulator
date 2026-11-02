# Example 157 — Net-probe cross-probe

## Goal
Select net `LED_A` and propagate that exact native net identity across breadboard, schematic, and PCB views. The result reports three views and the shared net ID.

## Direct circuit result

The base 5 V, 330 Ω, 2 V LED circuit has an ideal estimated current of 9.09 mA and resistor dissipation of 27.27 mW. Cross-probing links the schematic node to its corresponding views; it does not change this DC result.

## Run and verify
Select **Run**. The schematic opens with `LED_A` selected; switch between views and verify the same net is highlighted. Automated acceptance checks shared IDs, all three view names, endpoint count, and an unknown-net failure.

## Limits
Cross-probing synchronizes logical selection only. It does not route PCB copper or confirm manufacturing connectivity.
