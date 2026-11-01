# 084 — Local Wi-Fi relay controller fail-safe mock

## Purpose

Apply an authenticated-placeholder ON/OFF command to an ideal relay-driver state only when the configured local Wi-Fi link is online and requested coil current is within the configured guard.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| CMD1 | `input.wifi-relay-command` | Command ON; Token TEST_TOKEN |
| U1 | `active.wifi-relay-controller-ideal` | Mode local-relay; AuthMode placeholder; ExpectedToken TEST_TOKEN; OfflineState fail-safe |
| WIFI1 | `active.wifi-module-mock` | Mode local-mock; Link online |
| Q1 | `active.wifi-relay-driver-ideal` | Mode ideal-switch; RequestedCoilCurrentMa 70; MaximumCurrentMa 100 |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `controller:VCC`, `wifi:VCC`, `driver:VCC`
- **GND:** `supply:-`, `command:GND`, `controller:GND`, `wifi:GND`, `driver:GND`, `ground:0`
- **COMMAND:** `command:COMMAND`, `controller:CMD`
- **TOKEN:** `command:TOKEN`, `controller:TOKEN`
- **LINK:** `wifi:LINK`, `controller:LINK`
- **DRIVE:** `controller:DRIVE`, `driver:IN`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-wifi-relay-control`
- Engine: Local Wi-Fi relay command and ideal driver-state model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-wifi-relay-placeholder-auth-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41182884446

Recorded expected result:

```json
{
  "command": "ON",
  "linkState": "online",
  "authentication": "placeholder string comparison only",
  "authenticated": true,
  "transactionState": "applied-on",
  "relayEnergized": true,
  "requestedCoilCurrentMa": 70,
  "maximumCurrentMa": 100,
  "coilCurrentMa": 70,
  "physicalRelaySwitched": false,
  "networkTransmitted": false,
  "firmwareExecuted": false,
  "offlineState": "de-energized"
}
```

## Safety and model limits

Local behavior model only. The token comparison is a placeholder and is not security-grade authentication. It does not implement Wi-Fi, remote access, a physical relay, contact switching, coil dynamics, or device firmware.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/084-wifi-relay-controller.adigun.json`.