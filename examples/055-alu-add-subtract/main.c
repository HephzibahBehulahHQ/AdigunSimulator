#include <avr/io.h>
#include <stdbool.h>
#include <stdint.h>

int main(void)
{
    const uint8_t result_pins = 0x1f;
    DDRD = 0;
    PORTD = 0;
    DDRB &= (uint8_t)~_BV(PB0);
    PORTB &= (uint8_t)~_BV(PB0);
    PORTC &= (uint8_t)~result_pins;
    DDRC |= result_pins;

    for (;;) {
        const uint8_t operands = PIND;
        const uint8_t a = operands & 0x0f;
        const uint8_t b = operands >> 4;
        const bool subtract = (PINB & _BV(PB0)) != 0;
        const uint8_t result = a + (subtract ? (b ^ 0x0f) + 1 : b);
        PORTC = (PORTC & (uint8_t)~result_pins) | (result & result_pins);
    }
}
