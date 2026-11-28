import { findNativeBipolar } from "./bcp-native-parts.mjs";
import { findNativeMosfet } from "./native-mosfet-parts.mjs";
import { findNativeEeprom } from "./native-eeprom-parts.mjs";

export const findNativeCataloguePart = id => findNativeBipolar(id) ?? findNativeMosfet(id) ?? findNativeEeprom(id);
