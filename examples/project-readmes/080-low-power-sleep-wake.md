# 080 — Low-power sleep and interrupt wake

## Purpose

Estimate a generic MCU's time-weighted supply current while sleeping between rising-edge interrupts, ignore falling edges, and report the wake-driven LED load.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| SIG1 | `input.interrupt-edge-sequence-ideal` | Events 100:rising,130:falling,400:rising; DurationMs 500 |
| U1 | `active.low-power-mcu-ideal` | RunCurrentUa 5000; SleepCurrentUa 8; WakeDurationMs 20; WakeMode rising |
| R1 | `passive.resistor` | 1 kΩ |
| D1 | `diode.led-red` | Vf 2.0 V |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`
- **GND:** `supply:-`, `interrupts:GND`, `mcu:GND`, `led:K`, `ground:0`
- **INT:** `interrupts:INT`, `mcu:INT`
- **LED_DRIVE:** `mcu:LED`, `resistor:1`
- **LED_LOAD:** `resistor:2`, `led:A`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-low-power-sleep-wake`
- Engine: Ideal MCU sleep/wake duty and LED load estimate
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-mcu-sleep-wake-duty-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41181889479

Recorded expected result:

```json
{
  "supplyVoltage": 3.3,
  "durationMs": 500,
  "runCurrentUa": 5000,
  "sleepCurrentUa": 8,
  "wakeDurationMs": 20,
  "wakeMode": "rising",
  "wakeCount": 2,
  "ignoredEdges": [
    {
      "timeMs": 130,
      "edge": "falling"
    }
  ],
  "awakeTimeMs": 40,
  "sleepTimeMs": 460,
  "ledPeakCurrentMa": 1.3,
  "averageMcuCurrentUa": 407.36,
  "averageLedCurrentUa": 104,
  "averageSupplyCurrentUa": 511.36,
  "energyMj": 0.843744,
  "firmwareExecuted": false,
  "physicalSleepCurrent": "not verified"
}
```

## Safety and model limits

Ideal deterministic educational estimate only. The 8 µA sleep and 5 mA run currents are user-configured assumptions, not verified MCU specifications. It omits firmware, device-specific leakage, wake latency, oscillator startup, GPIO limits, regulator losses, component tolerances, and physical hardware validation.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/080-low-power-sleep-wake.adigun.json`.