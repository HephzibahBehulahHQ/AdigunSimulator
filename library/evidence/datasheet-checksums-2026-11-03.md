# Manufacturer datasheet checksum capture

Captured 2026-11-03 by downloading the PDF from the official manufacturer HTTPS URL and hashing the downloaded file bytes with PowerShell `Get-FileHash -Algorithm SHA256`. The temporary PDF was removed and was not committed.

| Part | Official source | Downloaded bytes | SHA-256 |
|---|---|---:|---|
| TI SN74HC74N | [SNx4HC74 datasheet](https://www.ti.com/lit/ds/symlink/sn74hc74.pdf) | 2,256,700 | `a4043d37d693a2997900a0542dd226b9b61285794f3c1a541adb99cc7dcb1ae2` |

The checksum identifies the exact PDF bytes captured at that time. It does not replace an independent technical review or validate the educational symbol, footprint, or simulator model.
