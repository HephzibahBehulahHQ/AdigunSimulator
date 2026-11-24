# Coilcraft forward-mode and current-sense transformer ordering evidence

- [CS60](https://www.coilcraft.com/en-us/products/transformers/power-transformers/current-sensing/cs60/). 3 order codes.
- [CST1-CST2](https://www.coilcraft.com/en-us/products/transformers/power-transformers/current-sensing/cst1-cst2/). 16 order codes.
- [CS4XXXX](https://www.coilcraft.com/en-us/products/transformers/power-transformers/current-sensing/cs4xxxx/). 3 order codes.
- [FCT1-XXM22SL](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-converter-transformers/fct1-xxm22sl/). 3 order codes.
- [FCT1-XXD3SL](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-converter-transformers/fct1-xxd3sl/). 5 order codes.
- [FCT1-XXL2SL](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-converter-transformers/fct1-xxl2sl/). 5 order codes.

The manufacturer tables display the exact order codes. Lifecycle confirmations, model validation, and independent review are pending.

## FCT1 winding and land mappings

- M22SL [winding diagram](https://www.coilcraft.com/getattachment/638c3175-0e56-45b4-93be-9c00df3b2c92/fct1xxm22sls.gif) and [land pattern](https://www.coilcraft.com/getattachment/007a8bc1-1834-40fa-9628-5d8695e19124/fct1xxm22sld.gif).
- D3SL [winding diagram](https://www.coilcraft.com/getattachment/a59aa569-d84d-43cf-97d5-a7aeace378a4/fct1xxd3slschematic.gif) and [land pattern](https://www.coilcraft.com/getattachment/a73892a2-e8c9-44a8-bf6e-c7fc7d0c61dd/fct1xxd3sldimensions.gif).
- L2SL [winding diagram](https://www.coilcraft.com/getattachment/fe6736db-49cb-4675-b054-22dc367421b0/fct1xxl2sls.gif) and [land pattern](https://www.coilcraft.com/getattachment/f4144b5b-d030-47bc-9d94-9f4cbcd78002/fct1xxl2sld.gif).

These 13 FCT1 records preserve polarity dots, physical lands, and required parallel winding connections. D3SL includes the distinct sync winding on pins 8 and 7. M22SL has two physical lands with no winding connection shown. Breadboard use requires a documented breakout. Native simulation and board-level isolation checks remain pending.

## Current transformer evidence

CST1 and CST2 use a common [land pattern](https://www.coilcraft.com/getattachment/175c3637-d6fc-41e5-b676-d19d4baaa7d3/cstdimensions.gif) with different [bottom-view terminal positions](https://www.coilcraft.com/getattachment/04971249-ce1f-4c3c-bf31-ad43a3350da9/cst_pinouts.gif). Both windings are documented separately for [CST1](https://www.coilcraft.com/getattachment/4d907512-5afc-4b36-ab48-40d1fa08b8ca/cst1schematic.gif) and [CST2](https://www.coilcraft.com/getattachment/fe5cff38-9a31-4f6c-a753-634f00fe0fbc/cst2schematic.gif). The top-view assets mirror the bottom-view pin positions horizontally.

The CS4xxxx [winding diagram](https://www.coilcraft.com/getattachment/02482b3e-1355-4776-82dd-27f34ad034cc/senhitrs.gif) and [top-view drill layout](https://www.coilcraft.com/getattachment/aaa33d20-60d3-4bad-8a6f-09e4e2adbc5b/senhitrd.gif) define the pin identities and unequal primary and secondary holes. The footprint carries hole geometry. Copper annular rings and isolation still require board-level validation.

The CS60 [schematic](https://www.coilcraft.com/getattachment/2e7e5a1a-4883-4d1c-8049-134d8a443f23/cs60schematic.gif) shows an external primary conductor through the aperture, secondary terminals 1 and 4, and terminal 2 unconnected. Its [mechanical drawing](https://www.coilcraft.com/getattachment/92fbd168-d8fe-4c2d-933a-fb595836b876/cs60dimensions.gif) provides pin geometry without a recommended PCB drill or copper layout. The three CS60 records therefore have symbols and remain pending footprint evidence.
