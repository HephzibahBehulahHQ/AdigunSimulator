# Example 166 — Forward/reverse motor interlock concept

## Objective
Model two mutually exclusive direction commands. A reverse request while forward is active (or forward while reverse is active) is rejected until a stop request returns the logic to idle.

## Run and expected result
Seven requests should produce states: forward, forward, forward, stopped, reverse, reverse, stopped. Requests 3 and 6 are rejected by the interlock; both direction outputs are never active together.

## Scope
Logical PLC concept only. No physical motor, contactors, drive, electrical reversing transient, coast time, wiring, overload, or machine-safety behavior is modeled. The native project contains no physical circuitry, so the electrical solver reports unsupported.
