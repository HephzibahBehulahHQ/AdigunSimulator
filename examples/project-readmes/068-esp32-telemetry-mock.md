# 068 — ESP32 offline temperature telemetry

A Seeed XIAO ESP32-C3 reads a Microchip MCP9700A-E/TO and prints a line of JSON over a local 3.3 V UART. Power the XIAO through its own USB-C socket. Its 3V3 output powers the sensor and C1, with a shared ground.

| Reference | Assembly |
| --- | --- |
| U1 | Seeed XIAO ESP32-C3, SKU 113991054 |
| TS1 | Microchip MCP9700A-E/TO, 10 mV/°C plus 500 mV offset |
| C1 | 100 nF sensor supply bypass |
| J1 | Samtec TSW-102-07-T-S, pin 1 ground and pin 2 3.3 V TX |

TS1 pin 1 goes to 3V3, pin 2 to D1 (GPIO3, ADC1_CH3), and pin 3 to ground. D6 (GPIO21) sends 9600-baud 8N1 output to J1. Connect only the receiver ground and 3.3 V-compatible RX. The receiver is off board and J1 is its controller-board connector. [Seeed pinout](https://wiki.seeedstudio.com/XIAO_ESP32C3_Getting_Started/), [Microchip sensor datasheet](https://ww1.microchip.com/downloads/aemDocuments/documents/APID/ProductDocuments/DataSheets/MCP970X-Data-Sheet-DS20001942.pdf), [Samtec J1](https://www.samtec.com/products/tsw-102-07-t-s).

On the BB400, orient the USB-C socket toward column 10 and use insulated pigtails for TS1. On the 48 × 35 mm PCB, form the center sensor lead for its staggered land pattern and leave room for the USB-C plug. The controller PCB uses two copper layers and 0.35 mm copper clearance. The native project supplies the pin, hole and route mappings for the three views and an educational fabrication export. [Seeed mechanical drawing](https://www.seeedstudio.com/blog/wp-content/uploads/2022/08/Seeed-Studio-XIAO-Series-Package-and-PCB-Design.pdf).

The [Arduino sketch](../068-esp32-telemetry-mock/068-esp32-telemetry-mock.ino) averages 16 calibrated millivolt readings, applies the sensor offset and emits a line approximately once per second. The sketch uses local UART only. The simulator retains deterministic offline JSON and exposes the ideal sensor voltage in the scope, 750 mV at 25 °C. The analytical ADC assumes a 3.3 V full-scale span. The firmware uses the ESP32-C3 calibration API with 11 dB attenuation. Sensor accuracy, ADC error, UART electrical levels and assembled hardware behavior require bench verification. [Espressif Arduino ADC documentation](https://docs.espressif.com/projects/arduino-esp32/en/latest/api/adc.html).
