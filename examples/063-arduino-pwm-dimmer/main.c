#include <avr/io.h>
#include <stdint.h>

enum { pwm_counts = 2040 };

int main(void)
{
    PORTB &= (uint8_t)~_BV(PB1);
    DDRB |= _BV(PB1);
    ICR1 = pwm_counts - 1;
    TCCR1A = _BV(WGM11);
    TCCR1B = _BV(WGM13) | _BV(WGM12) | _BV(CS11);

    ADMUX = _BV(REFS0);
    DIDR0 = _BV(ADC0D);
    ADCSRA = _BV(ADEN) | _BV(ADPS2) | _BV(ADPS1);

    for (;;) {
        ADCSRA |= _BV(ADSC);
        while (ADCSRA & _BV(ADSC)) {
        }
        const uint16_t value = ADC;
        if (value == 0) {
            TCCR1A = _BV(WGM11);
        } else {
            const uint16_t high_counts = ((uint32_t)value * pwm_counts + 511) / 1023;
            OCR1A = high_counts - 1;
            TCCR1A = _BV(COM1A1) | _BV(WGM11);
        }
    }
}
