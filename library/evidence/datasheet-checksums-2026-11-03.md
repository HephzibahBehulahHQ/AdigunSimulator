# Manufacturer datasheet checksum capture

Captured 2026-11-03 by downloading each PDF from the official manufacturer HTTPS URL and hashing the downloaded file bytes with PowerShell `Get-FileHash -Algorithm SHA256`. Temporary downloads are workspace artifacts and are not committed.

| Part | Official source | Downloaded bytes | SHA-256 |
|---|---|---:|---|
| TI SN74HC74N | [SNx4HC74 datasheet](https://www.ti.com/lit/ds/symlink/sn74hc74.pdf) | 2,256,700 | `a4043d37d693a2997900a0542dd226b9b61285794f3c1a541adb99cc7dcb1ae2` |
| TI SN74HC14N | [SNx4HC14 datasheet, Rev. L](https://www.ti.com/lit/ds/symlink/sn74hc14.pdf) | 2,079,245 | `24911ae018ad9bf6f8f069158b8689d0d941e3cde9f48924e2421276ae10e397` |
| TI SN74HC08N | [SNx4HC08 datasheet, Rev. J](https://www.ti.com/lit/ds/symlink/sn74hc08.pdf) | 2,048,028 | `0d125beb415972726a34eb93fbb7ce093909319f4252593fab37a7e77541e363` |
| TI SN74HC32N | [SNx4HC32 datasheet, Rev. F](https://www.ti.com/lit/ds/symlink/sn74hc32.pdf) | 2,124,679 | `18adcf7e59d693f9857a32200c28faf72bc84ac64f619411001bececd4fa96f0` |
| TI SN74HC86N | [SNx4HC86 datasheet, Rev. F](https://www.ti.com/lit/ds/symlink/sn74hc86.pdf) | 2,434,800 | `695a554fd72f6e9aaed4650af27c6ba419c6635bb241587f486c70fe564a3906` |

The checksum identifies the exact PDF bytes captured at that time. It does not replace an independent technical review or validate the educational symbol, footprint, or simulator model.
