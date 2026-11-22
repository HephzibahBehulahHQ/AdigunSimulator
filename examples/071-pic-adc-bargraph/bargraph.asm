        list p=16f886, r=dec
        #include <p16f886.inc>

        __config _CONFIG1, _INTRC_OSC_NOCLKOUT & _WDT_OFF & _PWRTE_ON & _MCLRE_ON & _CP_OFF & _CPD_OFF & _BOREN_ON & _IESO_OFF & _FCMEN_OFF & _LVP_OFF

        cblock 0x20
adc_low
adc_high
led_b
led_c
acquire_delay
        endc

; A segment turns on when the 10-bit sample reaches ceil(1023*n/10).
; PORTB and PORTC sink current into the individual bargraph cathodes.
threshold macro cutoff, mask, bit_index
        local turn_on, done
        movlw high(cutoff)
        subwf adc_high, w
        btfss STATUS, C
        goto done
        btfss STATUS, Z
        goto turn_on
        movlw low(cutoff)
        subwf adc_low, w
        btfss STATUS, C
        goto done
turn_on
        bcf mask, bit_index
done
        endm

        org 0x0000
        goto initialize
        org 0x0004
        goto initialize

initialize
        banksel OSCCON
        movlw 0x71
        movwf OSCCON
        banksel ANSEL
        movlw 0x01
        movwf ANSEL
        clrf ANSELH

        banksel PORTB
        movlw 0xff
        movwf PORTB
        movwf PORTC
        banksel TRISB
        movlw 0xc0
        movwf TRISB
        movlw 0xf0
        movwf TRISC
        movlw 0x80
        movwf ADCON1
        banksel ADCON0
        movlw 0x81
        movwf ADCON0

sample
        movlw 24
        movwf acquire_delay
acquire
        decfsz acquire_delay, f
        goto acquire
        bsf ADCON0, GO
conversion
        btfsc ADCON0, GO
        goto conversion
        movf ADRESH, w
        movwf adc_high
        banksel ADRESL
        movf ADRESL, w
        banksel adc_low
        movwf adc_low

        movlw 0xff
        movwf led_b
        movwf led_c
        threshold 103, led_b, 0
        threshold 205, led_b, 1
        threshold 307, led_b, 2
        threshold 410, led_b, 3
        threshold 512, led_b, 4
        threshold 614, led_b, 5
        threshold 717, led_c, 0
        threshold 819, led_c, 1
        threshold 921, led_c, 2
        threshold 1023, led_c, 3
        movf led_b, w
        movwf PORTB
        movf led_c, w
        movwf PORTC
        goto sample
        end
