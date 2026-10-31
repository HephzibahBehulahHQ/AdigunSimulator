# Example 161 — PLC start/stop motor concept

## Sequence
The deterministic six-step sequence begins idle, starts the contactor, releases the start button while the seal-in holds, opens the stop input, restarts, then trips the emergency-stop input. Acceptance requires the output to latch after start and drop on either stop condition.

## Run and verify
Select **Run** and inspect the step table. The output shows contactor/motor command state for each frame.

## Limits and safety
This is a Boolean logic concept only. It does not model PLC scan time, a physical contactor coil, motor current/torque, overload hardware, or a safety-rated emergency stop. Real machine safety requires independently designed and validated safety-rated hardware; this project does not certify it.
