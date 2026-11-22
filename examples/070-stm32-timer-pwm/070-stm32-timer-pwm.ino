#include <Arduino.h>
#include <HardwareTimer.h>

namespace {
constexpr uint32_t tickHz = 1000000;
constexpr uint32_t periodCounts = 1000;
constexpr uint32_t compareCounts = 499;
constexpr uint32_t channel = 1;
}

void setup()
{
    pinMode(A0, OUTPUT);
    digitalWrite(A0, LOW);

    static HardwareTimer pwm(TIM2);
    const uint32_t timerClockHz = pwm.getTimerClkFreq();
    if (timerClockHz < tickHz || timerClockHz % tickHz != 0) {
        return;
    }

    pwm.setMode(channel, TIMER_OUTPUT_COMPARE_PWM1, A0);
    pwm.setPrescaleFactor(timerClockHz / tickHz);
    pwm.setOverflow(periodCounts, TICK_FORMAT);
    pwm.setCaptureCompare(channel, compareCounts, TICK_COMPARE_FORMAT);
    pwm.refresh();
    pwm.resume();
}

void loop()
{
    // TIM2 generates the waveform independently of the main loop.
}
