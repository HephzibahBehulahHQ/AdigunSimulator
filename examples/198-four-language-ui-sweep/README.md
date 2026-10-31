# Example 198 — Four-language UI sweep

## Objective
Verify declared translation coverage for English, German, Yorùbá and Nigerian Pidgin, and check source-level accessibility and responsive-overflow safeguards.

## Automated checks
The audit verifies every declared interface key has a non-empty translation in all four locales; every localized HTML attribute uses a declared key; buttons, form controls and images have accessible names or alternative text; and the stylesheet retains mobile single-column, scrollable-toolbar, shrinking-canvas, wrapping-text and BOT-flow safeguards.

This is a source-level layout contract audit. It does not claim a browser-rendered pixel measurement or a screenshot at every viewport size.
