# Example 170 — Water leak alarm

## Objective
Drive a logical alarm and relay command from synthetic wet/dry sensor samples and verify that a dry sample clears the alarm.

## Run and expected result
The seven samples are dry, wet, wet, dry, dry, wet, dry. The alarm follows [off, on, on, off, off, on, off], representing two separate wet episodes and recovery after both.

## Scope
Boolean educational input only. No sensor probe, conductivity, corrosion, mains isolation, buzzer/relay load, ingress rating, false-alarm rejection, or real property protection is modeled.
