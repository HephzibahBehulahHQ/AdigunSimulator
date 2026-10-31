# Example 176 — Elevator call-queue concept

## Objective
Model deterministic first-in-first-out floor-call scheduling with duplicate pending-call coalescing.

## Run and expected result
Calls for floors 3, 2, and 3 create queue states [3], [3,2], [3,2]. The duplicate floor-3 call is ignored. Three dispatch events output targets 3 then 2, followed by an empty-queue result.

## Scope
This models request scheduling only. It does not move an elevator car or model travel time, position sensors, door logic, load, overspeed protection, interlocks, emergency systems, or elevator safety compliance.
