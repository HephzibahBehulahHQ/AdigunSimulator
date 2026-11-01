# 099 — E-paper display updater

## Purpose

Choose a partial or full e-paper refresh from changed-tile fraction, panel power state, busy timeout, and partial-refresh ghosting limit; report the refresh state sequence and estimated completion time.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| REQ1 | `input.epaper-update-request` | Refresh partial; ChangedTiles 1; TotalTiles 100; BusyMs 800; TimeoutMs 1200; PowerState sleep; PanelPower on; PartialsSinceFull 1 |
| U1 | `active.epaper-update-controller-ideal` | Mode e-paper; PartialLimit 0.20; GhostRefreshLimit 4; MaxBusyMs 2000 |
| EPD1 | `output.epaper-panel-report` | Panel 200x200; Partial yes |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `source:+`, `request:VCC`, `controller:VCC`, `report:VCC`
- **GND:** `source:-`, `request:GND`, `controller:GND`, `report:GND`, `ground:0`
- **REQUEST:** `request:CONFIG`, `controller:REQ`
- **PANEL_DATA:** `controller:DATA`, `report:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-epaper-display-updater`
- Engine: Analytical e-paper refresh planner with power, changed-area, ghosting, and busy-timeout guards
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-epaper-refresh-sequencer-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41186427236

Recorded expected result:

```json
{
  "kind": "epaper-refresh",
  "changedFraction": 0.01,
  "wakeOccurred": true,
  "stateSequence": [
    "WAKE",
    "LOAD_PARTIAL_DIFF",
    "PARTIAL_REFRESH",
    "WAIT_BUSY",
    "UPDATE_COMPLETE",
    "RETURN_TO_SLEEP"
  ],
  "estimatedDurationMs": 875,
  "partialsSinceFullAfter": 2,
  "firmwareExecuted": false,
  "panelDriven": false,
  "refreshMode": "partial",
  "changedTiles": 1,
  "totalTiles": 100,
  "partialLimit": 0.2,
  "partialsSinceFullBefore": 1,
  "powerStateBefore": "sleep",
  "panelPower": "on",
  "busyTimeoutMs": 1200,
  "refreshCompleted": true,
  "powerStateAfter": "sleep"
}
```

## Safety and model limits

Ideal refresh-state estimator only. It does not drive an e-paper panel, execute MCU firmware, model image quality, temperature-dependent waveform timing, ghosting physics, voltage rails, or hardware safety.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/099-epaper-display-updater.adigun.json`.