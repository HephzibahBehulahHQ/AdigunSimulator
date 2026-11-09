import test from "node:test";
import assert from "node:assert/strict";
import { createProject, addComponent, parseProject, serializeProject, runSupportedAnalysis, connectPins, disconnectPin, removeComponent } from "../js/core.mjs";
import { componentFields, componentFieldValue, editComponentField, editCustomProperties } from "../js/component-edit.mjs";
import { schematicPinPoint } from "../js/schematic-pin-layout.mjs";
import { removeNetEdge, netEdges } from "../js/net-edges.mjs";

test("numeric property edits update the simulator's native value with selected units", () => {
  const original = createProject();
  const resistance = editComponentField(original, "resistor-1", "valueNumber", "470");
  assert.equal(resistance.components.find(item => item.instanceId === "resistor-1").value, "470 Ω");
  assert.notDeepEqual(runSupportedAnalysis(resistance).result, runSupportedAnalysis(original).result);
  const scaled = editComponentField(resistance, "resistor-1", "valueUnit", "kΩ");
  assert.equal(scaled.components.find(item => item.instanceId === "resistor-1").value, "470 kΩ");
  assert.equal(componentFieldValue(scaled.components.find(item => item.instanceId === "resistor-1"), "valueNumber"), 470);
  assert.throws(() => editComponentField(original, "resistor-1", "valueNumber", "NaN"));
  assert.throws(() => editComponentField(original, "resistor-1", "valueNumber", "0"));
  assert.throws(() => editComponentField(original, "resistor-1", "valueUnit", "V"));
});

test("identity, ratings, custom fields and geometry survive native save/reopen without changing nets", () => {
  const original = createProject(); let project = original;
  for (const [key, value] of Object.entries({ reference:"R99", description:"LED limiter", partNumber:"user candidate", manufacturer:"User supplied", powerRatingW:"0.25", x:"235", y:"180", width:"112", height:"116", rotation:"90" })) project = editComponentField(project, "resistor-1", key, value);
  project = editCustomProperties(project, "resistor-1", [{ key:"<note>", value:"<script>not markup</script>" }]);
  const reopened = parseProject(serializeProject(project)), component = reopened.components.find(item => item.instanceId === "resistor-1");
  assert.equal(component.reference,"R99"); assert.equal(component.properties.powerRatingW,0.25);
  assert.deepEqual(component.position.schematic,[235,180]);
  assert.deepEqual(component.geometry.schematic,{width:112,height:116,rotation:90});
  assert.deepEqual(reopened.nets,original.nets); assert.equal(component.properties.custom[0].key,"<note>");
  assert.equal(original.components.find(item => item.instanceId === "resistor-1").geometry,undefined);
});

test("invalid references, geometry and custom rows cannot mutate a valid project", () => {
  const project = createProject(), before = serializeProject(project);
  for (const [key,value] of [["reference",""],["reference","V1"],["width",0],["height",Infinity],["rotation",361],["currentRatingA",-1],["x",""]]) assert.throws(()=>editComponentField(project,"resistor-1",key,value));
  assert.throws(()=>editCustomProperties(project,"resistor-1",[{key:"same",value:"a"},{key:"same",value:"b"}]));
  assert.equal(serializeProject(project),before);
  const invalid = structuredClone(project); invalid.components[0].properties={custom:"broken"};
  assert.throws(()=>parseProject(JSON.stringify(invalid)),/custom fields/);
});

test("resized and rotated symbol anchors remain geometrically coincident with the native terminals", () => {
  const component={libraryId:"passive.resistor",position:{schematic:[100,80]},geometry:{schematic:{width:112,height:116,rotation:90}}};
  const left=schematicPinPoint(component,["1","2"],"1"),right=schematicPinPoint(component,["1","2"],"2");
  assert.ok(Math.abs(left.x-156)<1e-9);assert.ok(Math.abs(left.y-94)<1e-9);
  assert.ok(Math.abs(right.x-156)<1e-9);assert.ok(Math.abs(right.y-182)<1e-9);
  assert.equal(componentFields(component,"pcb").some(field=>field.key==="width"),false);
});

test("wire deletion splits an electrical graph, retains other edges and can serialize the result", () => {
  let project=createProject(); project=addComponent(project,"passive.resistor"); const id=project.components.at(-1).instanceId;
  project.nets=[{id:"CHAIN",endpoints:["source-1:+","resistor-1:1",`${id}:1`,"led-1:A"],connections:[["source-1:+","resistor-1:1"],["resistor-1:1",`${id}:1`],[`${id}:1`,"led-1:A"]]}];
  const removed=removeNetEdge(project,"CHAIN","resistor-1:1",`${id}:1`);
  assert.equal(removed.nets.length,2);assert.equal(removed.nets.flatMap(netEdges).length,2);
  assert.ok(removed.nets.every(net=>net.endpoints.length===2));assert.doesNotThrow(()=>parseProject(serializeProject(removed)));
  const joined=connectPins(removed,"resistor-1:1",`${id}:1`);
  assert.equal(joined.nets.length,1); assert.equal(joined.nets[0].connections.length,3);
  assert.doesNotThrow(()=>parseProject(serializeProject(disconnectPin(joined,`${id}:1`))));
  assert.doesNotThrow(()=>parseProject(serializeProject(removeComponent(joined,id))));
});
