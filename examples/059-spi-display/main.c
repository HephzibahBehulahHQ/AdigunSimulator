#include <avr/io.h>
#include <stdint.h>

int main(void)
{
    PORTD = 0;
    DDRD = 0xff;
    DDRB &= (uint8_t)~(_BV(PB2) | _BV(PB3) | _BV(PB4) | _BV(PB5));
    PORTB = (PORTB & (uint8_t)~(_BV(PB3) | _BV(PB4) | _BV(PB5))) | _BV(PB2);
    SPCR = _BV(SPE);

    for (;;) {
        if (SPSR & _BV(SPIF)) {
            PORTD = SPDR;
        }
    }
}
