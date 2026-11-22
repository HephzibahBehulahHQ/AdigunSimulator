#include <avr/io.h>
#include <stdbool.h>
#include <stdint.h>

int main(void)
{
    DDRD &= (uint8_t)~_BV(PD2);
    PORTD &= (uint8_t)~_BV(PD2);
    PORTB &= (uint8_t)~_BV(PB5);
    DDRB |= _BV(PB5);

    /* 8 MHz / 64 / 125 gives a nominal 1 kHz sampling clock. */
    TCCR0A = _BV(WGM01);
    OCR0A = 124;
    TIFR0 = _BV(OCF0A);
    TCCR0B = _BV(CS01) | _BV(CS00);

    bool stable = false;
    bool candidate = false;
    uint8_t count = 0;
    for (;;) {
        if (!(TIFR0 & _BV(OCF0A))) {
            continue;
        }
        TIFR0 = _BV(OCF0A);
        const bool input = (PIND & _BV(PD2)) != 0;
        if (input != candidate) {
            candidate = input;
            count = 0;
        }
        if (count < 3) {
            ++count;
        }
        if (count == 3 && stable != candidate) {
            stable = candidate;
            if (stable) {
                PINB = _BV(PB5);
            }
        }
    }
}
