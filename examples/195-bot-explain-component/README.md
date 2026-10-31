# Example 195 — Adigun BOT explains a component

## Objective
Show a component explanation grounded only in its native-project fields and checked-in component-library record.

## Expected result
The fixture asks Adigun BOT to explain resistor R1. The result cites the project for its reference and configured value, and the checked-in library for its description, pin names, supported views, simulation model and record status. The library entry does not include manufacturer, MPN or a verified datasheet, so the response states those fields are unknown.

## Limits and privacy
This example runs locally and does not call an AI service or perform a web lookup. It does not infer ratings, compatibility, safety, manufacturer identity or datasheet facts that are absent from the recorded fields. Check the actual component marking and manufacturer documentation before relying on a physical part.
