#define F_CPU 8000000UL
#include <avr/io.h>
#include <stdint.h>
#include <util/delay.h>

enum { bit_ticks = 833 };

static void lcd_send(uint8_t byte)
{
    uint16_t deadline = TCNT1 + bit_ticks;
    PORTB &= (uint8_t)~_BV(PB0);
    for (uint8_t bit = 0; bit < 8; ++bit) {
        while ((int16_t)(TCNT1 - deadline) < 0) {
        }
        if (byte & 1) {
            PORTB |= _BV(PB0);
        } else {
            PORTB &= (uint8_t)~_BV(PB0);
        }
        byte >>= 1;
        deadline += bit_ticks;
    }
    while ((int16_t)(TCNT1 - deadline) < 0) {
    }
    PORTB |= _BV(PB0);
    deadline += bit_ticks;
    while ((int16_t)(TCNT1 - deadline) < 0) {
    }
}

static void lcd_text(const char *text)
{
    while (*text) {
        lcd_send((uint8_t)*text++);
    }
}

int main(void)
{
    PORTB |= _BV(PB0);
    DDRB |= _BV(PB0);
    TCCR1B = _BV(CS10);

    ADMUX = _BV(REFS0);
    DIDR0 = _BV(ADC0D);
    ADCSRA = _BV(ADEN) | _BV(ADPS2) | _BV(ADPS1);

    _delay_ms(500);
    lcd_send(12);
    _delay_ms(10);
    lcd_send(22);

    for (;;) {
        ADCSRA |= _BV(ADSC);
        while (ADCSRA & _BV(ADSC)) {
        }
        const uint16_t tenths = ((uint32_t)ADC * 5000 + 511) / 1023;
        lcd_send(128);
        lcd_text("Temp ");
        lcd_send(tenths >= 1000 ? '0' + tenths / 1000 : ' ');
        lcd_send(tenths >= 100 ? '0' + tenths / 100 % 10 : ' ');
        lcd_send('0' + tenths / 10 % 10);
        lcd_send('.');
        lcd_send('0' + tenths % 10);
        lcd_text(" C   ");
        _delay_ms(500);
    }
}
