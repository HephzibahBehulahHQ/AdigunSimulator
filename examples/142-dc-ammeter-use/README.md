# DC ammeter use

## Goal

Measure the current in a 9 V, 1 kΩ/2 kΩ divider with a series ammeter model. The configured 0.1 Ω burden resistance is included, the reading is available in amperes and displayed in milliamperes, and lead polarity is reported.

## Run

Open the example and select Run. The output dashboard shows current, ideal reference, burden resistance, burden voltage and polarity.

## Acceptance

Automated checks compare the result with the 3 mA Ohm’s-law reference, confirm burden modeling, reject a meter placed across R1, and verify that reversed terminals produce negative current.

## Direct divider result

The native 9 V, 1 kΩ/2 kΩ divider produces 3 mA and an unloaded 6 V output in the bounded DC analyzer. The ammeter example reports a separate burden-adjusted measurement of 2.9999 mA; the two values describe different models.

## Limits

This is an analytical resistive DC measurement. It does not model fuse/range protection, transient current, instrument accuracy, wiring faults or safe live-work procedure. Follow the real instrument’s rated range and safety instructions.
