#include <avr/io.h>
#include <stdbool.h>
#include <stdint.h>

/* PC0–PC5: NS red, NS yellow, NS green, EW red, EW yellow, EW green. */
static const uint8_t lamp_masks[] = {
    0x0c, 0x0a, 0x09, 0x21, 0x11, 0x09
};

int main(void)
{
    const uint8_t lamp_pins = 0x3f;
    const uint8_t clock_pin = _BV(PD2);
    const uint8_t phase_reset_pin = _BV(PD3);
    uint8_t phase = 0;

    DDRD &= (uint8_t)~(clock_pin | phase_reset_pin);
    PORTD &= (uint8_t)~(clock_pin | phase_reset_pin);
    PORTC = (PORTC & (uint8_t)~lamp_pins) | lamp_masks[phase];
    DDRC |= lamp_pins;

    bool previous_clock_high = (PIND & clock_pin) != 0;
    for (;;) {
        const uint8_t inputs = PIND;
        const bool clock_high = (inputs & clock_pin) != 0;
        if (!(inputs & phase_reset_pin)) {
            phase = 0;
        } else if (clock_high && !previous_clock_high) {
            phase = (phase + 1) % (sizeof lamp_masks / sizeof lamp_masks[0]);
        }
        previous_clock_high = clock_high;
        PORTC = (PORTC & (uint8_t)~lamp_pins) | lamp_masks[phase];
    }
}
