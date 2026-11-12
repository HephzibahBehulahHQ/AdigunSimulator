#include <math.h>
#include <stdbool.h>
#include <stdio.h>
#include <stdlib.h>

#include "ngspice/sharedspice.h"

int main(int argc, char **argv) {
    char source_command[4096];
    char *vector_name;
    char *expected_end;
    pvector_info output;
    double measured, expected;

    if (argc != 4) {
        fprintf(stderr, "usage: %s <netlist> <vector> <expected-value>\n", argv[0]);
        return 2;
    }
    vector_name = argv[2];
    expected = strtod(argv[3], &expected_end);
    if (expected_end == argv[3] || *expected_end != '\0' || !isfinite(expected)) {
        fputs("expected operating-point value must be finite\n", stderr);
        return 2;
    }
    if (snprintf(source_command, sizeof source_command, "source %s", argv[1]) >=
        (int)sizeof source_command) {
        fputs("netlist path is too long\n", stderr);
        return 2;
    }
    if (ngSpice_Init(NULL, NULL, NULL, NULL, NULL, NULL, NULL) != 0) {
        fputs("ngSpice_Init failed\n", stderr);
        return 1;
    }
    if (ngSpice_Command(source_command) != 0 || ngSpice_Command("op") != 0) {
        fputs("ngspice failed to load or solve the operating-point netlist\n", stderr);
        return 1;
    }

    output = ngGet_Vec_Info(vector_name);
    if (output == NULL || output->v_realdata == NULL || output->v_length < 1) {
        fputs("ngspice did not expose the v(out) operating-point vector\n", stderr);
        return 1;
    }
    measured = output->v_realdata[output->v_length - 1];
    if (!isfinite(measured) || fabs(measured - expected) > 1e-9) {
        fprintf(stderr, "expected %s=%.12g V, received %.12g V\n", vector_name, expected, measured);
        return 1;
    }
    printf("native ngspice operating-point smoke passed: %s=%.12g V\n", vector_name, measured);
    return 0;
}

