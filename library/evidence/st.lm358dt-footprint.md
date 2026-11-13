# STMicroelectronics LM358DT footprint evidence

Footprint state: educational candidate; not approved for fabrication
Evidence checked: 2026-11-13

## Manufacturer evidence

- [LM358 product page](https://www.st.com/en/amplifiers-and-comparators/lm358.html)
- [LM358 datasheet, DocID2163 Rev. 15](https://www.st.com/resource/en/datasheet/lm358.pdf)

ST lists LM358DT as active in SO8. The datasheet's SO8 mechanical data gives a 1.27 mm lead pitch, 4.80–5.00 mm package length, 3.80–4.00 mm body width, 5.80–6.20 mm outer lead span, and 0.28–0.48 mm lead width. The footprint places pins in the datasheet's standard 1–4 and 5–8 rows.

## Layout limits

This JSON is an educational land pattern. The 5.62 mm row-center spacing is derived from typical outer lead span (6.00 mm) less typical lead width (0.38 mm). The 1.55 mm × 0.65 mm copper pads are application-selected defaults; this datasheet does not supply a recommended SO8 land pattern. The asset has not passed independent footprint review, assembly-process review, or manufacturing DRC.

Do not claim this candidate is an ST-approved footprint or fabrication-ready. Confirm the package against a physical device and select pad geometry, solder-mask, paste-mask, courtyard, and tolerances with the board fabricator.
