# 088 — RFID inventory and slot collision fixture

## Purpose

Enumerate a bounded set of idealized RFID UID fixtures using an explicit deterministic UID-to-slot hash, then report duplicate UIDs and slot collisions for a repeatable inventory exercise.

## Bill of materials

| Reference | Project library ID | Project value |
|---|---|---|
| V1 | `power.dc-source` | 5 V |
| TAGS1 | `input.rfid-inventory-fixture` | UIDs 04A1B2C3,11223344,AABBCCDD,DEADBEEF,04A1B2C3; Slots 4 |
| RFID1 | `active.rfid-inventory-reader-ideal` | Mode inventory; Band 13.56 MHz; Slots 4 |
| DISP1 | `output.rfid-inventory-report` | Inventory report |
| GND | `ground.signal` | 0 V |

These are the exact component records in the native example file. A library ID and value do not establish that a manufacturer part, footprint, or electrical model has been independently verified.

## Net connections

- **VCC:** `supply:+`, `reader:VCC`, `report:VCC`
- **GND:** `supply:-`, `fixture:GND`, `reader:GND`, `report:GND`, `ground:0`
- **RFID_TAGS:** `fixture:TAGS`, `reader:TAGS`
- **RFID_DATA:** `reader:DATA`, `report:DATA`

## Views and physical-layout status

No verified breadboard pin-hole map is stored; the view must not be interpreted as a wiring-ready physical breadboard.

No stored PCB fabrication geometry is present. The PCB view is a conceptual/shared layout and must not be used to fabricate a board.

## Acceptance test and expected result

- Stable test ID: `core-rfid-inventory`
- Engine: Deterministic RFID UID-to-slot inventory fixture
- Engine version: `adigun-simulator@0.1.0`
- Model version: `deterministic-rfid-uid-slot-inventory-v1`
- Passing CI run: https://github.com/HephzibahBehulahHQ/AdigunSimulator/actions/runs/41184259116

Recorded expected result:

```json
{
  "kind": "rfid-inventory",
  "bandMHz": 13.56,
  "slotCount": 4,
  "tagCount": 5,
  "uniqueUidCount": 4,
  "duplicateUidCount": 1,
  "occupiedSlots": 3,
  "collisionSlotCount": 1,
  "collisions": [
    {
      "slot": 3,
      "uids": [
        "04A1B2C3",
        "DEADBEEF"
      ],
      "tagCount": 3
    }
  ],
  "inventoryComplete": false,
  "slotAssignmentModel": "last UID byte modulo slot count",
  "rfTransmitted": false,
  "antiCollisionProtocolModeled": false,
  "authenticationModeled": false,
  "firmwareExecuted": false
}
```

## Safety and model limits

Deterministic educational UID-to-slot fixture only. It is not an RFID air-interface implementation. Anti-collision protocol timing, RF coupling, modulation, reader certification, secure authentication, firmware, and hardware behavior are not modeled or verified.

Review the model's stated limits and all exact component datasheets before transferring this example to physical hardware. A passing automated test does not establish electrical safety, compliance, or manufacturing readiness.

Native project: `examples/088-rfid-inventory.adigun.json`.