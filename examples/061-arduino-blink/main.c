#define F_CPU 8000000UL
#include <avr/io.h>
#include <stdint.h>
#include <util/delay.h>

int main(void)
{
    PORTB &= (uint8_t)~_BV(PB5);
    DDRB |= _BV(PB5);

    for (;;) {
        PORTB |= _BV(PB5);
        _delay_ms(500);
        PORTB &= (uint8_t)~_BV(PB5);
        _delay_ms(500);
    }
}
