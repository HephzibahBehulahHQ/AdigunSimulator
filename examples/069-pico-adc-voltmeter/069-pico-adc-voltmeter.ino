#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <Arduino.h>
#include <Wire.h>

namespace {
constexpr uint8_t adcPin = 26;
constexpr uint8_t sdaPin = 4;
constexpr uint8_t sclPin = 5;
constexpr uint8_t displayAddress = 0x3c;
constexpr uint16_t fullScale = 4095;
constexpr float referenceVolts = 3.3f;
constexpr float dividerGain = 4.0f;
Adafruit_SSD1306 display(128, 32, &Wire, -1);
}

void setup()
{
    analogReadResolution(12);
    Wire.setSDA(sdaPin);
    Wire.setSCL(sclPin);
    Wire.begin();
    while (!display.begin(SSD1306_SWITCHCAPVCC, displayAddress, false, false)) {
        delay(250);
    }
    display.setTextColor(SSD1306_WHITE);
    display.setTextSize(2);
}

void loop()
{
    uint32_t total = 0;
    constexpr uint8_t sampleCount = 16;
    for (uint8_t sample = 0; sample < sampleCount; ++sample) {
        total += analogRead(adcPin);
    }
    const float counts = static_cast<float>(total) / sampleCount;
    display.clearDisplay();
    display.setCursor(0, 8);
    if (counts >= fullScale - 5) {
        display.setTextSize(1);
        display.print("ADC FULL SCALE");
        display.setTextSize(2);
    } else {
        display.print(counts * referenceVolts * dividerGain / fullScale, 2);
        display.print(" V");
    }
    display.display();
    delay(250);
}
