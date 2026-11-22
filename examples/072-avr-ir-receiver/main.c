#define F_CPU 8000000UL
#include <avr/io.h>
#include <stdbool.h>
#include <stdint.h>
#include <util/delay.h>

static bool level_is_high(void)
{
    return (PIND & _BV(PD2)) != 0;
}

static uint16_t measure_level(bool high, uint16_t timeout_us)
{
    const uint16_t start = TCNT1;
    while (level_is_high() == high) {
        if ((uint16_t)(TCNT1 - start) >= timeout_us) {
            return 0;
        }
    }
    return TCNT1 - start;
}

static bool within(uint16_t actual, uint16_t nominal)
{
    const uint16_t tolerance = nominal / 5;
    return actual >= nominal - tolerance && actual <= nominal + tolerance;
}

static bool decode(uint8_t bytes[4])
{
    if (!within(measure_level(false, 11000), 9000) ||
        !within(measure_level(true, 5500), 4500)) {
        return false;
    }
    for (uint8_t byte = 0; byte < 4; ++byte) {
        for (uint8_t bit = 0; bit < 8; ++bit) {
            if (!within(measure_level(false, 700), 560)) {
                return false;
            }
            const uint16_t space = measure_level(true, 2100);
            if (within(space, 1690)) {
                bytes[byte] |= (uint8_t)(1u << bit);
            } else if (!within(space, 560)) {
                return false;
            }
        }
    }
    return within(measure_level(false, 700), 560) &&
           (uint8_t)(bytes[0] ^ bytes[1]) == UINT8_MAX &&
           (uint8_t)(bytes[2] ^ bytes[3]) == UINT8_MAX;
}

static void lcd_send(uint8_t value)
{
    while (!(UCSR0A & _BV(UDRE0))) {
    }
    UDR0 = value;
}

static void lcd_text(const char *text)
{
    while (*text) {
        lcd_send((uint8_t)*text++);
    }
}

static void lcd_hex(uint8_t value)
{
    const char hex[] = "0123456789ABCDEF";
    lcd_send(hex[value >> 4]);
    lcd_send(hex[value & 15]);
}

int main(void)
{
    TCCR1B = _BV(CS11);
    UBRR0 = 51;
    UCSR0B = _BV(TXEN0);
    UCSR0C = _BV(UCSZ01) | _BV(UCSZ00);

    _delay_ms(500);
    lcd_send(12);
    _delay_ms(10);
    lcd_send(22);

    for (;;) {
        while (!level_is_high()) {
        }
        while (level_is_high()) {
        }
        uint8_t bytes[4] = {0};
        if (decode(bytes)) {
            lcd_send(128);
            lcd_text("ADDR ");
            lcd_hex(bytes[0]);
            lcd_text(" CMD ");
            lcd_hex(bytes[2]);
            lcd_text("  ");
        }
    }
}
