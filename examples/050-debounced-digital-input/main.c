#include <avr/io.h>
#include <stdbool.h>
#include <stdint.h>

#define STABLE_SAMPLES 3

int main(void)
{
    const uint8_t clock_pin = _BV(PD2);
    const uint8_t phase_reset_pin = _BV(PD3);
    const uint8_t raw_pin = _BV(PD4);
    const uint8_t output_pin = _BV(PC0);
    const uint8_t input_pins = clock_pin | phase_reset_pin | raw_pin;
    uint8_t samples = 0;
    bool candidate_high = false;
    bool output_high = false;

    DDRD &= (uint8_t)~input_pins;
    PORTD &= (uint8_t)~input_pins;
    PORTC &= (uint8_t)~output_pin;
    DDRC |= output_pin;

    bool previous_clock_high = (PIND & clock_pin) != 0;
    for (;;) {
        const uint8_t inputs = PIND;
        const bool clock_high = (inputs & clock_pin) != 0;
        if (!(inputs & phase_reset_pin)) {
            samples = 0;
            output_high = false;
        } else if (clock_high && !previous_clock_high) {
            const bool input_high = (inputs & raw_pin) != 0;
            if (!samples || input_high != candidate_high) {
                candidate_high = input_high;
                samples = 1;
            } else if (samples < STABLE_SAMPLES) {
                ++samples;
            }
            if (samples == STABLE_SAMPLES) {
                output_high = candidate_high;
            }
        }
        previous_clock_high = clock_high;
        if (output_high) {
            PORTC |= output_pin;
        } else {
            PORTC &= (uint8_t)~output_pin;
        }
    }
}
