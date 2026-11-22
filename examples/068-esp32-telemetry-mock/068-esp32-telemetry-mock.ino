#include <Arduino.h>

namespace {
constexpr uint8_t sensorPin = 3;    // XIAO D1, ADC1_CH3
constexpr uint8_t transmitPin = 21; // XIAO D6
constexpr uint8_t receivePin = 20;  // XIAO D7, left unconnected
constexpr uint32_t samples = 16;
constexpr int sensorZeroMillivolts = 500;
constexpr float millivoltsPerDegree = 10.0f;
uint32_t sequence = 1;

float readTemperature()
{
    uint32_t sum = 0;
    for (uint32_t sample = 0; sample < samples; ++sample) {
        sum += analogReadMilliVolts(sensorPin);
    }
    const float millivolts = static_cast<float>(sum) / samples;
    return (millivolts - sensorZeroMillivolts) / millivoltsPerDegree;
}
} // namespace

void setup()
{
    analogReadResolution(12);
    analogSetPinAttenuation(sensorPin, ADC_11db);
    Serial1.begin(9600, SERIAL_8N1, receivePin, transmitPin);
}

void loop()
{
    Serial1.printf("{\"device\":\"esp32-node-01\",\"sequence\":%lu,\"temperatureC\":%.1f}\n",
                   static_cast<unsigned long>(sequence), readTemperature());
    sequence = sequence == 2147483647UL ? 1 : sequence + 1;
    delay(1000);
}
