#define F_CPU 8000000UL
#include <avr/io.h>
#include <stdint.h>
#include <util/delay.h>

enum { steps = 200, period_us = 5000, high_us = 10 };

static void wait_until(uint16_t deadline)
{
    while ((int16_t)(TCNT1 - deadline) < 0) {
    }
}

int main(void)
{
    /* Set direction and keep the motor disabled while the output pins settle. */
    PORTD |= _BV(PD2) | _BV(PD4);
    PORTD &= (uint8_t)~_BV(PD3);
    DDRD |= _BV(PD2) | _BV(PD3) | _BV(PD4);
    TCCR1B = _BV(CS11);
    _delay_ms(10);
    PORTD &= (uint8_t)~_BV(PD4);
    _delay_ms(2);

    uint16_t start = TCNT1;
    for (uint16_t step = 0; step < steps; ++step) {
        wait_until(start);
        PORTD |= _BV(PD3);
        wait_until(start + high_us);
        PORTD &= (uint8_t)~_BV(PD3);
        start += period_us;
    }
    wait_until(start);

    /* Disable bridge current at the end of the default move. */
    PORTD |= _BV(PD4);
    for (;;) {
    }
}
