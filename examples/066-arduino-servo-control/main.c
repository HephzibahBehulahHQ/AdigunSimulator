#include <avr/io.h>
#include <stdint.h>

enum { frame_us = 20000, center_us = 1500, minimum_us = 1000, span_us = 1000 };

int main(void)
{
    /* Timer1 runs at 1 MHz with the undivided 8 MHz system clock. */
    ICR1 = frame_us - 1;
    OCR1A = center_us;
    TCCR1A = _BV(COM1A1) | _BV(WGM11);
    TCCR1B = _BV(WGM13) | _BV(WGM12) | _BV(CS11);
    DDRB |= _BV(PB1);

    ADMUX = _BV(REFS0);
    DIDR0 = _BV(ADC0D);
    ADCSRA = _BV(ADEN) | _BV(ADPS2) | _BV(ADPS1);

    for (;;) {
        ADCSRA |= _BV(ADSC);
        while (ADCSRA & _BV(ADSC)) {
        }
        const uint16_t sample = ADC;
        /* Fast PWM transfers OCR1A at BOTTOM, keeping each pulse intact. */
        OCR1A = minimum_us + ((uint32_t)sample * span_us + 511) / 1023;
    }
}
