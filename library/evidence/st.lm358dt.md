# STMicroelectronics LM358DT evidence review

Review state: candidate; not verified  
Evidence checked: 2026-11-02

## Primary manufacturer evidence

- [ST LM358DT product and lifecycle page](https://www.st.com/en/amplifiers-and-comparators/lm358.html)
- [LM358 datasheet, DocID2163 revision 15](https://www.st.com/resource/en/datasheet/lm358.pdf)

ST lists the exact LM358DT order code as active in the SO-8 package. The datasheet pin diagram gives:

| Pin | Signal | Logical electrical type |
|---:|---|---|
| 1 | OUT1 | analog |
| 2 | IN1− | analog |
| 3 | IN1+ | analog |
| 4 | VCC− | power-in |
| 5 | IN2+ | analog |
| 6 | IN2− | analog |
| 7 | OUT2 | analog |
| 8 | VCC+ | power-in |

ST lists a PSpice model on its product page, but it has not been retrieved, rights-reviewed, or validated against this simulator. ST PDF download failed during this evidence pass, so no datasheet checksum is claimed.

## Verification still required

- Retrieve canonical datasheet bytes and record a reproducible SHA-256 checksum.
- Add licensed symbol and SO-8 footprint assets; independently check pad numbering and geometry.
- Retrieve and rights-review the official model, build fixture tests, and document its accuracy limits.
- Add complete ratings, warnings, breadboard limits, alternatives, and four-locale metadata.
- Obtain independent human review and date.

The record remains a candidate and is excluded from the verified-part count.

