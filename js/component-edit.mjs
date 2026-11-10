import { findLibraryPart, updateComponent, moveComponent } from "./core.mjs";
import { validateComponentProperty } from "./component-property-audit.mjs";
import { schematicGeometry } from "./schematic-pin-layout.mjs";

// Only these numeric fields change engine input. Ratings and part metadata are annotations.
export const COMPONENT_SCHEMAS = Object.freeze({
  "passive.resistor": { label: "Resistance", units: ["Ω", "kΩ", "MΩ"], min: 0.01, max: 1e9 },
  "passive.capacitor": { label: "Capacitance", units: ["F", "mF", "µF", "nF", "pF"], min: Number.MIN_VALUE, max: 1e6 },
  "passive.inductor": { label: "Inductance", units: ["H", "mH", "µH"], min: Number.MIN_VALUE, max: 1e6 },
  "power.dc-source": { label: "Voltage", units: ["V", "mV"], min: 0, max: 1e6 },
});
const factors = { "Ω": 1, "kΩ": 1e3, "MΩ": 1e6, F: 1, mF: 1e-3, "µF": 1e-6, nF: 1e-9, pF: 1e-12, H: 1, mH: 1e-3, "µH": 1e-6, V: 1, mV: 1e-3 };
export function numericComponentValue(component) {
  const schema = COMPONENT_SCHEMAS[component.libraryId];
  if (!schema) return null;
  const match = String(component.value).trim().match(/^([+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*(.*)$/i);
  const unit = match?.[2].replace(/^u/, "µ") || schema.units[0];
  return match && schema.units.includes(unit) ? { number: Number(match[1]), unit } : null;
}
export function componentFields(component, view = "schematic") {
  const fields = [
    { key: "description", label: "Description", type: "textarea", section: "Identity" },
    ...(["voltageRatingV", "currentRatingA", "powerRatingW"].map((key, i) => ({ key, label: ["Voltage rating (V)", "Current rating (A)", "Power rating (W)"][i], type: "number", section: "Ratings (annotations)" }))),
    ...(["partNumber", "manufacturer", "notes"].map((key, i) => ({ key, label: ["Part number / model", "Manufacturer", "Part notes"][i], type: key === "notes" ? "textarea" : "text", section: "Part (user supplied)" })))
  ];
  const numeric = COMPONENT_SCHEMAS[component.libraryId];
  if (numeric) fields.splice(1, 0, { key: "valueNumber", label: numeric.label, type: "number", section: "Electrical model" }, { key: "valueUnit", label: "Unit", type: "select", options: numeric.units, section: "Electrical model" });
  else if (String(component.value).includes(";") || component.libraryId.startsWith('plc.')) {
    fields.splice(1, 0, ...String(component.value).split(";").flatMap((segment,index) => {
      const match = segment.trim().match(/^(\S+)\s+(.+)$/);
      return match ? [{ key: `modelSegment${index}`, label: match[1], type: "text", section: "Electrical model" }] : [];
    }));
  }
  if (view === "schematic") fields.push(...["x", "y", "width", "height", "rotation"].map(key => ({ key, label: ({ x: "X", y: "Y", width: "Width", height: "Height", rotation: "Rotation (°)" })[key], type: "number", section: "Schematic geometry (drawing units)" })));
  return fields;
}
export function componentFieldValue(component, key) {
  if (/^modelSegment\d+$/.test(key)) return String(component.value).split(";")[Number(key.slice(12))]?.trim().replace(/^\S+\s+/, "") ?? "";
  if (key === "valueNumber" || key === "valueUnit") return numericComponentValue(component)?.[key === "valueNumber" ? "number" : "unit"] ?? "";
  if (["width", "height", "rotation"].includes(key)) return schematicGeometry(component)[key];
  if (["x", "y"].includes(key)) return component.position?.schematic?.[key === "x" ? 0 : 1] ?? 120;
  if (["reference", "value"].includes(key)) return component[key];
  return component.properties?.[key] ?? "";
}
export function editComponentField(project, id, key, raw) {
  const component = project.components.find(item => item.instanceId === id);
  if (!component || !findLibraryPart(component.libraryId)) throw new Error("Select a known component first.");
  const text = String(raw ?? "");
  if (text.length > 4000) throw new Error("Keep this field within 4000 characters.");
  if (/^modelSegment\d+$/.test(key)) {
    const segments = String(component.value).split(";").map(segment => segment.trim()), index = Number(key.slice(12));
    const match = segments[index]?.match(/^(\S+)\s+(.+)$/);
    if (!match || !text.trim() || text.includes(";")) throw new Error("Enter one nonempty model parameter.");
    segments[index] = `${match[1]} ${text.trim()}`;
    return editComponentField(project, id, "value", segments.join("; "));
  }
  if (key === "reference") {
    const reference = text.trim();
    if (!reference || reference.length > 64 || project.components.some(item => item.instanceId !== id && item.reference === reference)) throw new Error("Use a nonempty, unique reference (up to 64 characters).");
    const next = updateComponent(project, id, { reference });
    if (next.pcbFabrication?.parts) next.pcbFabrication.parts = next.pcbFabrication.parts.map(part => part.instanceId === id ? { ...part, reference } : part);
    return next;
  }
  if (["value", "valueNumber", "valueUnit"].includes(key)) {
    let value = text.trim();
    if (key !== "value") {
      const schema = COMPONENT_SCHEMAS[component.libraryId], existing = numericComponentValue(component);
      const number = key === "valueNumber" ? Number(text) : existing?.number;
      const unit = key === "valueUnit" ? text : existing?.unit ?? schema?.units[0];
      const actual = number * factors[unit];
      if (!schema || !text.trim() || !schema.units.includes(unit) || !Number.isFinite(actual) || actual < schema.min || actual > schema.max) throw new Error("Enter a finite value within the supported model range.");
      value = `${number} ${unit}`;
    }
    if (!value) throw new Error("Model value cannot be empty.");
    const validation = validateComponentProperty(component, value);
    if (!validation.valid) throw new Error(validation.errors[0].message);
    return updateComponent(project, id, { value });
  }
  if (["x", "y"].includes(key)) {
    if (!text.trim() || !Number.isFinite(Number(text))) throw new Error("Enter a finite position.");
    const position = [...(component.position?.schematic ?? [120, 120])];
    position[key === "x" ? 0 : 1] = Number(text);
    return moveComponent(project, id, "schematic", position);
  }
  if (["width", "height", "rotation"].includes(key)) {
    const number = Number(text), limits = { width: [28, 240], height: [29, 180], rotation: [-360, 360] }[key];
    if (!text.trim() || !Number.isFinite(number) || number < limits[0] || number > limits[1]) throw new Error(`Enter ${key} from ${limits[0]} to ${limits[1]}.`);
    return updateComponent(project, id, { geometry: { ...component.geometry, schematic: { ...schematicGeometry(component), [key]: number } } });
  }
  if (!componentFields(component).some(field => field.key === key) || ["valueNumber", "valueUnit"].includes(key)) throw new Error("Unsupported property.");
  const properties = { ...component.properties };
  if (["voltageRatingV", "currentRatingA", "powerRatingW"].includes(key)) {
    if (text.trim() && (!Number.isFinite(Number(text)) || Number(text) < 0)) throw new Error("A rating must be a finite, nonnegative number.");
    if (!text.trim()) delete properties[key]; else properties[key] = Number(text);
  } else properties[key] = text;
  return updateComponent(project, id, { properties });
}
export function editCustomProperties(project, id, rows) {
  if (!Array.isArray(rows) || rows.length > 30) throw new Error("Use up to 30 custom fields.");
  const keys = new Set();
  for (const row of rows) {
    if (!row || typeof row.key !== "string" || !row.key.trim() || row.key.length > 64 || keys.has(row.key.trim()) || typeof row.value !== "string" || row.value.length > 4000) throw new Error("Use unique, nonempty custom names and values within the field limits.");
    keys.add(row.key.trim());
  }
  const component = project.components.find(item => item.instanceId === id);
  if (!component) throw new Error("Select a component first.");
  return updateComponent(project, id, { properties: { ...component.properties, custom: rows.map(row => ({ key: row.key.trim(), value: row.value })) } });
}
