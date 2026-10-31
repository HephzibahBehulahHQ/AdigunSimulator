# Example 177 — Fire-alarm zone monitor concept

## Objective
Classify synthetic zone inputs as normal, alarm, open-circuit trouble, or short-circuit trouble. Keep fire alarm and wiring trouble outputs distinct.

## Run and expected result
The five samples (normal, alarm, open, short, normal) should produce one alarm sample, two trouble samples, one open fault, and one short fault. The buzzer output is on only for the alarm condition.

## Scope
Input classification only. This is not a fire alarm design or life-safety system. No detector performance, supervised-circuit standards, notification appliances, backup power, local fire code, evacuation action, or certification is modeled.
