#define F_CPU 8000000UL
#include <avr/io.h>
#include <stdbool.h>
#include <stdint.h>
#include <util/delay.h>
#include <util/twi.h>

enum {
    oled_address = 0x3c,
    echo_timeout_us = 25000,
    minimum_mm = 20,
    maximum_mm = 4000
};

static bool wait_twi(uint8_t expected)
{
    const uint16_t started = TCNT1;
    while (!(TWCR & _BV(TWINT))) {
        if ((uint16_t)(TCNT1 - started) >= 2000) {
            return false;
        }
    }
    return TW_STATUS == expected;
}

static bool send_twi(uint8_t value, uint8_t expected)
{
    TWDR = value;
    TWCR = _BV(TWINT) | _BV(TWEN);
    return wait_twi(expected);
}

static bool oled_write(uint8_t control, const uint8_t *bytes, uint8_t length)
{
    TWCR = _BV(TWINT) | _BV(TWSTA) | _BV(TWEN);
    bool ready = wait_twi(TW_START)
        && send_twi(oled_address << 1, TW_MT_SLA_ACK)
        && send_twi(control, TW_MT_DATA_ACK);
    for (uint8_t index = 0; ready && index < length; ++index) {
        ready = send_twi(bytes[index], TW_MT_DATA_ACK);
    }
    TWCR = _BV(TWINT) | _BV(TWSTO) | _BV(TWEN);
    const uint16_t started = TCNT1;
    while (TWCR & _BV(TWSTO)) {
        if ((uint16_t)(TCNT1 - started) >= 2000) {
            TWCR = 0;
            return false;
        }
    }
    return ready;
}

static bool oled_position(uint8_t page)
{
    const uint8_t commands[] = {0xb0 | page, 0x00, 0x10};
    return oled_write(0x00, commands, sizeof commands);
}

static bool oled_initialize(void)
{
    const uint8_t commands[] = {
        0xae, 0xd5, 0x80, 0xa8, 0x1f, 0xd3, 0x00, 0x40,
        0x8d, 0x14, 0x20, 0x02, 0xa1, 0xc8, 0xda, 0x02,
        0x81, 0x8f, 0xd9, 0xf1, 0xdb, 0x40, 0xa4, 0xa6
    };
    const uint8_t blank[128] = {0};
    if (!oled_write(0x00, commands, sizeof commands)) {
        return false;
    }
    for (uint8_t page = 0; page < 4; ++page) {
        if (!oled_position(page) || !oled_write(0x40, blank, sizeof blank)) {
            return false;
        }
    }
    const uint8_t display_on = 0xaf;
    return oled_write(0x00, &display_on, 1);
}

static bool wait_capture(uint16_t started)
{
    while (!(TIFR1 & _BV(ICF1))) {
        if ((uint16_t)(TCNT1 - started) >= echo_timeout_us) {
            return false;
        }
    }
    return (uint16_t)(ICR1 - started) < echo_timeout_us;
}

static uint16_t measure_echo_us(void)
{
    TCCR1B |= _BV(ICES1);
    TIFR1 = _BV(ICF1);
    const uint16_t trigger_time = TCNT1;
    PORTB |= _BV(PB1);
    _delay_us(12);
    PORTB &= (uint8_t)~_BV(PB1);
    if (!wait_capture(trigger_time)) {
        return 0;
    }
    const uint16_t rising = ICR1;
    TCCR1B &= (uint8_t)~_BV(ICES1);
    TIFR1 = _BV(ICF1);
    return wait_capture(rising) ? (uint16_t)(ICR1 - rising) : 0;
}

static bool display_distance(uint16_t echo_us)
{
    static const uint8_t digits[10][5] = {
        {0x3e,0x51,0x49,0x45,0x3e}, {0,0x42,0x7f,0x40,0},
        {0x42,0x61,0x51,0x49,0x46}, {0x21,0x41,0x45,0x4b,0x31},
        {0x18,0x14,0x12,0x7f,0x10}, {0x27,0x45,0x45,0x45,0x39},
        {0x3c,0x4a,0x49,0x49,0x30}, {0x01,0x71,0x09,0x05,0x03},
        {0x36,0x49,0x49,0x49,0x36}, {0x06,0x49,0x49,0x29,0x1e}
    };
    static const uint8_t letter_m[] = {0x7c,0x04,0x18,0x04,0x78};
    uint8_t row[42] = {0};
    const uint32_t scaled_mm = (uint32_t)echo_us * 343;
    const uint16_t millimetres = (scaled_mm + 1000) / 2000;
    const bool valid = scaled_mm >= minimum_mm * 2000UL && scaled_mm <= maximum_mm * 2000UL;

    for (uint8_t place = 0; place < 4; ++place) {
        const uint16_t divisor = (uint16_t[]){1000, 100, 10, 1}[place];
        const uint8_t digit = millimetres / divisor % 10;
        for (uint8_t column = 0; column < 5; ++column) {
            if (valid && millimetres >= divisor) {
                row[place * 6 + column] = digits[digit][column];
            } else if (!valid) {
                row[place * 6 + column] = 0x08;
            }
        }
    }
    for (uint8_t column = 0; column < 5; ++column) {
        row[30 + column] = letter_m[column];
        row[36 + column] = letter_m[column];
    }
    return oled_position(1) && oled_write(0x40, row, sizeof row);
}

int main(void)
{
    DDRB |= _BV(PB1);
    TCCR1B = _BV(ICNC1) | _BV(CS11);
    TWBR = 32;
    _delay_ms(100);

    bool display_ready = false;
    for (;;) {
        if (!display_ready) {
            display_ready = oled_initialize();
        }
        const uint16_t echo_us = measure_echo_us();
        if (display_ready) {
            display_ready = display_distance(echo_us);
        }
        _delay_ms(100);
    }
}
