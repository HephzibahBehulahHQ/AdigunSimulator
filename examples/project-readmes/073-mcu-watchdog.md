# 073 — Microcontroller watchdog reset recovery

## Purpose

Evaluate a deterministic MCU watchdog service sequence and place the controller in a safe reset state after a missed service.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| SIG1 | `input.watchdog-service-sequence` | ServiceTimesMs 0,40,80,230; RunDurationMs 300 |
| U1 | `active.mcu-watchdog-ideal` | Program Watchdog state model; TimeoutMs 100 |
| DISP1 | `output.watchdog-status-display` | Watchdog state |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `mcu:VCC`, `display:VCC`
- **GND:** `supply:-`, `fixture:GND`, `mcu:GND`, `display:GND`, `ground:0`
- **WDI:** `fixture:OUT`, `mcu:WDI`
- **HEARTBEAT:** `mcu:HEARTBEAT`, `display:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-mcu-watchdog`
- Engine: Ideal MCU watchdog service-sequence model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-mcu-watchdog-sequence-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41180050577

Recorded expected result:

```json
{
  "timeoutMs": 100,
  "runDurationMs": 300,
  "serviceTimesMs": [
    0,
    40,
    80,
    230
  ],
  "servicesAccepted": 3,
  "resetCount": 1,
  "resetAtMs": 180,
  "controllerState": "safe-reset",
  "heartbeatHigh": false,
  "firmwareExecuted": false
}
```

## Safety and model limits

Ideal logical timing model only. No MCU firmware, device-specific watchdog clock tolerance, reset circuitry, interrupt latency, or hardware behavior is modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/073-mcu-watchdog.adigun.json`.