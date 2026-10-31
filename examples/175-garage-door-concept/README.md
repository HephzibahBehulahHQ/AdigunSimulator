# Example 175 — Garage-door limit-switch concept

## Objective
Exercise open/close relay commands against synthetic end-limit events. A reached limit stops motion; a conflicting opposite-direction request is rejected while moving.

## Run and expected result
Starting closed, requests produce modes [opening, stopped, closing, closing, stopped, stopped, opening]. The fourth request to open is rejected while closing; open and closed limit events stop their respective commands. Drive outputs are mutually exclusive.

## Scope
Logical sequence only. No door mass or travel, motor or relay behavior, braking, obstruction sensor, force limiting, photoeye, entrapment protection, installation, or safety certification is modeled.
