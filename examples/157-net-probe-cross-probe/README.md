# Example 157 — Net-probe cross-probe

## Goal
Select net `LED_A` and propagate that exact native net identity across breadboard, schematic, and PCB views. The result reports three views and the shared net ID.

## Run and verify
Select **Run**. The schematic opens with `LED_A` selected; switch between views and verify the same net is highlighted. Automated acceptance checks shared IDs, all three view names, endpoint count, and an unknown-net failure.

## Limits
Cross-probing synchronizes logical selection only. It does not route PCB copper or confirm manufacturing connectivity.
