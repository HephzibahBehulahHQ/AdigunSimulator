#define F_CPU 8000000UL
#define BAUD 9600
#include <avr/io.h>
#include <stdint.h>
#include <util/setbaud.h>

int main(void)
{
    DDRB |= _BV(PB0);
    PORTB &= (uint8_t)~_BV(PB0);
    UBRR0H = UBRRH_VALUE;
    UBRR0L = UBRRL_VALUE;
    UCSR0A = USE_2X ? _BV(U2X0) : 0;
    UCSR0C = _BV(UCSZ01) | _BV(UCSZ00);
    UCSR0B = _BV(RXEN0);

    for (;;) {
        if (UCSR0A & _BV(RXC0)) {
            const uint8_t status = UCSR0A;
            (void)UDR0;
            if (status & (_BV(FE0) | _BV(DOR0))) {
                PORTB &= (uint8_t)~_BV(PB0);
            } else {
                PORTB |= _BV(PB0);
            }
        }
    }
}
