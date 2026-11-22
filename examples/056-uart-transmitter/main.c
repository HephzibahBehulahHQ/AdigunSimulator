#define F_CPU 8000000UL
#define BAUD 9600
#include <avr/io.h>
#include <util/delay.h>
#include <util/setbaud.h>

int main(void)
{
    UBRR0H = UBRRH_VALUE;
    UBRR0L = UBRRL_VALUE;
    UCSR0A = USE_2X ? _BV(U2X0) : 0;
    UCSR0C = _BV(UCSZ01) | _BV(UCSZ00);
    UCSR0B = _BV(TXEN0);

    for (;;) {
        while (!(UCSR0A & _BV(UDRE0))) {
        }
        UDR0 = 0xa5;
        _delay_ms(100);
    }
}
