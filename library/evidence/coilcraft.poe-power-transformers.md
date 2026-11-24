# Coilcraft PoE power transformer ordering evidence

- [POEXXQ](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-over-ethernet/poexxq/). 10 order codes.
- [POE62_71F](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-over-ethernet/poe62_71f/). 10 order codes.
- [POE600](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-over-ethernet/poe600/). 4 order codes.
- [POE120PL](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-over-ethernet/poe120pl/). 4 order codes.
- [POE300](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-over-ethernet/poe300/). 5 order codes.
- [POEXXP](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-over-ethernet/poexxp/). 11 order codes.
- [POE13_60F](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-over-ethernet/poe13_60f/). 12 order codes.
- [POEXXC](https://www.coilcraft.com/en-us/products/transformers/power-transformers/power-over-ethernet/poexxc/). 10 order codes.

The specification tables list 66 exact manufacturer order codes across these eight groups. Model validation, lifecycle evidence, and independent review remain pending. Native pin and footprint assets are available for POExxQ, POE62F, POE71F, POE600F, POE120PL, and POE300F.

## POExxQ and POE62F / POE71F mapping

The [POExxQ schematic](https://www.coilcraft.com/getattachment/00b2d63f-82ca-4a14-a6d8-bc855677d929/poexxqs.gif) and [mechanical drawing](https://www.coilcraft.com/getattachment/f4c2de8d-6729-427a-8e80-0d353f9c709b/poexxqd-%282%29.gif) specify ten lands and pin 1 at the upper left. The 48 V codes have one secondary. The other codes have two secondary windings whose starts (9, 10) and ends (6, 7) must be joined on the PCB. The 14.99 mm inner gap plus one 1.55 mm pad gives 16.54 mm between row centers.

The [POE62F / POE71F schematic](https://www.coilcraft.com/getattachment/7fc80240-df18-43f8-b6c8-94c13bcf9937/poe62fs.gif) and [mechanical drawing](https://www.coilcraft.com/getattachment/02363985-9b1d-4d7a-989e-d3320c760435/poe62fd.gif) specify twelve lands with the same pin-1 orientation. The 23.62 mm inner gap plus one 3.30 mm pad gives 26.92 mm between row centers. Join primary terminals 1 and 2, and 3 and 4, respectively. Join secondary starts 10, 11 and 12 together and secondary ends 7, 8 and 9 together. The symbols preserve individual windings and identify these board connections. Native simulation and board-level isolation validation remain pending.

## POE600F, POE120PL, and POE300F mapping

The [POE600F winding diagram](https://www.coilcraft.com/getattachment/ece45167-8255-4c56-b995-09524e5bf03f/poe600fs.gif) and [land pattern](https://www.coilcraft.com/getattachment/a2c5e045-ab5c-4007-8457-c340536e7d99/poe600fd.gif) use the same twelve-terminal land geometry as the [POE300F winding diagram](https://www.coilcraft.com/getattachment/9a885ea8-577d-47f1-9b01-f39f4eb81c1a/poe300s.gif) and [land pattern](https://www.coilcraft.com/getattachment/94dd003b-911a-4447-a368-7f9bc753b582/poe300d.gif). The auxiliary polarity differs: POE600F starts at pin 6, while POE300F starts at pin 5. Both drawings require parallel primary and secondary connections on the PCB.

The [POE120PL winding diagram](https://www.coilcraft.com/getattachment/4f83885b-e7b6-4eb8-b30b-fde1ea99769b/poe120pls.gif) shows a primary tap at pin 4 and secondary start at pin 8. Its [land pattern](https://www.coilcraft.com/getattachment/51590a4d-54c0-489a-99bb-8f7ac7590e36/poe120pld.gif) has seven circular SMT lands, with 2.03 mm diameter on the primary side and 2.79 mm on the secondary side. Maximum height depends on the output variant. Native transformer analysis and board-level isolation checks remain pending.
