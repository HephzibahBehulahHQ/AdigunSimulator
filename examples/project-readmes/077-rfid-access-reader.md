# 077 — RFID UID allowlist lock demonstration

## Purpose

Compare an ideal RFID UID against an explicit allowlist, grant a simulated lock output for a match, and deny unknown tags.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 3.3 V |
| TAG1 | `input.rfid-uid-fixture` | UID 04A1B2C3 |
| RFID1 | `active.rfid-uid-reader-ideal` | Mode UID-only; Band 13.56 MHz |
| U1 | `active.rfid-access-controller-ideal` | Allowlist 04A1B2C3,11223344; UnlockState 1; DenyState 0 |
| LOCK1 | `output.lock-state-indicator-ideal` | Simulated lock state |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `reader:VCC`, `controller:VCC`, `indicator:VCC`
- **GND:** `supply:-`, `tag:GND`, `reader:GND`, `controller:GND`, `indicator:GND`, `ground:0`
- **TAG_UID:** `tag:UID`, `reader:TAG`
- **UID_DATA:** `reader:DATA`, `controller:TAG`
- **LOCK_STATE:** `controller:LOCK`, `indicator:CTRL`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-rfid-access-reader`
- Engine: Ideal RFID UID allowlist behavior model
- Engine version: `adigun-simulator@0.1.0`
- Model version: `ideal-rfid-uid-allowlist-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41181196082

Recorded expected result:

```json
{
  "allowedUid": "04A1B2C3",
  "allowlistedDecision": "granted",
  "allowlistedLockOutput": 1,
  "unknownUid": "DEADBEEF",
  "unknownDecision": "denied",
  "unknownLockOutput": 0,
  "authentication": "UID only; not secure",
  "firmwareExecuted": false
}
```

## Safety and model limits

UID-only identification is cloneable and is not cryptographic authentication or a security-grade access-control design. RF coupling, anti-collision, credentials, firmware, and physical lock behavior are not modeled.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/077-rfid-access-reader.adigun.json`.