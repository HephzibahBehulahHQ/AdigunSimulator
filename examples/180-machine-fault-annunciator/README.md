# Example 180 — Machine fault annunciator

## Objective
Latch fault indications until both the input is inactive and an operator acknowledgement is recorded. Show fault lamp and buzzer behavior for active, acknowledged, and cleared states.

## Run and expected result
F1 becomes active and latches; acknowledgement silences its buzzer but does not clear the fault while active. When F1 clears, the acknowledged latch clears. F2 then activates and clears before acknowledgement: it remains latched and buzzer-active until the final acknowledgement removes it.

## Scope
Deterministic logic concept only. No field input circuit, industrial alarm priority, audible-level specification, safety function, machine interlock, reliability, or compliance is modeled.
