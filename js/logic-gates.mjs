// Ideal Boolean functions shared by the native library, solver, symbols and copilot.
// These are logical terminals, not a manufacturer's package pin numbering.
const operations = {
  and: { label: "AND", inputs: ["A", "B"], evaluate: ([a, b]) => a & b },
  or: { label: "OR", inputs: ["A", "B"], evaluate: ([a, b]) => a | b },
  xor: { label: "XOR", inputs: ["A", "B"], evaluate: ([a, b]) => a ^ b },
  nor: { label: "NOR", inputs: ["A", "B"], evaluate: ([a, b]) => Number(!(a | b)) },
  nand: { label: "NAND", inputs: ["A", "B"], evaluate: ([a, b]) => Number(!(a & b)) },
  not: { label: "NOT", inputs: ["A"], evaluate: ([a]) => Number(!a) },
  xnor: { label: "XNOR", inputs: ["A", "B"], evaluate: ([a, b]) => Number(a === b) },
};
export const LOGIC_GATES = Object.freeze(Object.fromEntries(Object.entries(operations).map(([operation, definition]) => [
  `active.logic-${operation}-ideal`, Object.freeze({ ...definition, operation, inputs: Object.freeze(definition.inputs), pins: Object.freeze([...definition.inputs, "Y", "VCC", "GND"]) })
])));
export function evaluateLogicGate(operation, inputs) {
  const model = operations[operation];
  if (!model || inputs.length !== model.inputs.length || inputs.some(level => level !== 0 && level !== 1)) throw new Error("A known gate and binary input on every input terminal are required.");
  return model.evaluate(inputs);
}
export const ADDITIONAL_LOGIC_PARTS = Object.freeze(["nand", "not", "xnor"].map(operation => {
  const id = `active.logic-${operation}-ideal`, gate = LOGIC_GATES[id];
  return Object.freeze({ id, category: "Active", type: `Ideal ${gate.label} gate (digital event model)`, prefix: "U", pins: gate.pins, defaultValue: "Ideal zero-delay logic", simulation: "bounded-digital-event", status: "generic educational model; not a manufacturer part", views: { breadboard: false, schematic: true, pcb: false } });
}));
