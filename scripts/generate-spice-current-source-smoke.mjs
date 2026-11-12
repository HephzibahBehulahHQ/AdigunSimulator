import { writeFile } from "node:fs/promises";
import { addComponent, connectPins, createEmptyProject } from "../js/core.mjs";
import { exportSpiceNetlist } from "../js/spice-netlist.mjs";

const outputPath = process.argv[2];
if (!outputPath) throw new Error("Pass an output path for the ngspice smoke deck.");

let project = createEmptyProject({ name: "Exported ideal current-source smoke" });
for (const id of ["power.dc-current-source", "passive.resistor", "ground.signal"]) project = addComponent(project, id);
const pin = (reference, terminal) => `${project.components.find((part) => part.reference === reference).instanceId}:${terminal}`;
for (const [first, second] of [
  [pin("I1", "+"), pin("R1", "1")],
  [pin("R1", "2"), pin("I1", "-")],
  [pin("GND1", "0"), pin("I1", "-")]
]) project = connectPins(project, first, second);
project = {
  ...project,
  components: project.components.map((part) => part.reference === "I1"
    ? { ...part, value: "10 mA" }
    : part.reference === "R1" ? { ...part, value: "1 kΩ" } : part)
};

const result = exportSpiceNetlist(project);
if (!result.ok) throw new Error(result.error);
const ending = ".end\n";
if (!result.netlist.endsWith(ending)) throw new Error("Exporter did not produce a complete SPICE deck.");
// The test harness adds the operating-point command; product export remains netlist-only.
const smokeNetlist = result.netlist.replace(
  "* No analysis directive or manufacturer-specific device model is included.",
  "* CI appends an operating-point directive; the product export itself is analysis-free."
);
const analysisDeck = `${smokeNetlist.slice(0, -ending.length)}.op\n${ending}`;
await writeFile(outputPath, analysisDeck, { encoding: "utf8", flag: "wx" });
