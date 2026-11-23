import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {filterExamples,pcbCoverage,EXPECTED_DIAGNOSTICS} from '../js/example-bank.mjs';
import {runProjectAnalysis} from '../js/analysis-dispatch.mjs';
import {renderPcbPreviewSvg} from '../js/pcb-preview.mjs';
import {parseExampleProject,canLoadExampleAnalysis} from '../js/example-loading.mjs';
import {describeExample} from '../js/example-bank-ui.mjs';
import {projectComponentsForView} from '../js/view-projection.mjs';
import {findLibraryPart,updateComponent,validateProject} from '../js/core.mjs';
import {validatePcbFabrication,exportPcbFabrication} from '../js/pcb-export.mjs';
import {validateBreadboardTopology} from '../js/breadboard-topology.mjs';
import {validateBreadboardAssembly,renderBreadboardAssemblySvg} from '../js/breadboard-assembly.mjs';
import {netEdges} from '../js/net-edges.mjs';
import {routeSchematicConnection} from '../js/schematic-routing.mjs';
const index=JSON.parse(await readFile(new URL('../examples/index.json',import.meta.url),'utf8'));
test('coverage descriptions distinguish component, package and pad counts',()=>{
 const e={components:6,pcbStatus:'stored',pcbParts:2,pcbPads:4,unmapped:[],analysis:'complete'};
 assert.match(describeExample(e),/6 components.*2 parts, 4 pads.*Not a manufacturing verification/);
 for(const locale of ['en','de','yo','pcm'])assert.doesNotMatch(describeExample(e,locale),/undefined/);
 assert.match(describeExample({...e,analysis:'expected-diagnostic'}),/Expected diagnostic/);
});
test('the example index audits every native project without inventing PCB packages or successful diagnostics',async()=>{
 const files=(await readdir(new URL('../examples/',import.meta.url))).filter(f=>f.endsWith('.adigun.json')).sort();
 assert.deepEqual(index.entries.map(e=>e.file),files);assert.equal(new Set(files).size,216);
 for(const entry of index.entries){
  const raw=await readFile(new URL('../examples/'+entry.file,import.meta.url),'utf8'),p=JSON.parse(raw),pcb=pcbCoverage(p),analysis=runProjectAnalysis(p);
  assert.equal(entry.sha256,createHash('sha256').update(raw.replaceAll('\r\n','\n')).digest('hex'),entry.file+' index is stale');
  assert.ok(entry.type&&entry.level&&entry.category);assert.equal(entry.pcbParts,pcb.parts);assert.equal(entry.pcbStatus,pcb.status);
  assert.equal(analysis.state,EXPECTED_DIAGNOSTICS.has(entry.file)?'blocked':'complete',entry.file);
  if(pcb.parts)assert.match(renderPcbPreviewSvg(p),/data-pcb-footprint=/);
 }
 assert.equal(index.summary.withStoredPcb,105);assert.equal(index.summary.withoutStoredPcb,111);assert.deepEqual(index.summary.unexpectedFailures,[]);
});
test('Example 001 LED current limiter routes its return without assigning a footprint to the GND symbol',async()=>{
 const entry=index.entries.find(item=>item.file==='001-led-current-limiter.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/001-led-current-limiter.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,3);assert.equal(entry.pcbPads,6);
 assert.deepEqual(entry.unmapped,[]);assert.deepEqual(pcbCoverage(project).missing,[]);
 assert.deepEqual(projectComponentsForView(project,'pcb').reconciliationItems,[]);
 assert.deepEqual(project.pcbFabrication.nonPhysicalItems.map(item=>item.reference),['GND']);
 assert.equal(validatePcbFabrication(project).status,'passed');
 assert.equal(runProjectAnalysis(project).result.kind,'led-current-limiter');
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="led-1"/);
});
test('9 V LED Current Limiter maps sourced through-hole parts and connected PCB copper',async()=>{
 const entry=index.entries.find(item=>item.file==='003-led-current-limiter-9v.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/003-led-current-limiter-9v.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,3);assert.equal(entry.pcbPads,6);
 assert.deepEqual(entry.unmapped,[]);assert.deepEqual(projectComponentsForView(project,'pcb').reconciliationItems,[]);
 assert.deepEqual(project.pcbFabrication.nonPhysicalItems.map(item=>item.reference),['GND']);
 assert.equal(project.pcbFabrication.parts.find(item=>item.reference==='R1').manufacturerPartNumber,'CFR25J470R');
 assert.deepEqual(project.pcbFabrication.physicalEvidence.map(item=>item.reference),['J1','R1','D1']);
 assert.equal(validatePcbFabrication(project).status,'passed');
 assert.equal(runProjectAnalysis(project).result.kind,'led-current-limiter');
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="led-1"/);
});
test('DC Voltage Divider has sourced physical resistor values, mapped pads and connected copper',async()=>{
 const entry=index.entries.find(item=>item.file==='002-dc-voltage-divider.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/002-dc-voltage-divider.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,3);assert.equal(entry.pcbPads,6);
 assert.deepEqual(entry.unmapped,[]);assert.deepEqual(projectComponentsForView(project,'pcb').reconciliationItems,[]);
 assert.deepEqual(project.pcbFabrication.nonPhysicalItems.map(item=>item.reference),['GND']);
 assert.equal(validatePcbFabrication(project).status,'passed');
 assert.equal(runProjectAnalysis(project).result.kind,'voltage-divider');
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="resistor-bottom-1"/);
 assert.deepEqual(project.pcbFabrication.physicalEvidence.map(item=>item.reference),['J1','R1','R2']);
});
test('9 V divider maps both resistors and its source across printable BB400, schematic and PCB views',async()=>{
 const entry=index.entries.find(item=>item.file==='009-dc-voltage-divider-3k-1k.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/009-dc-voltage-divider-3k-1k.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,3);assert.equal(entry.pcbPads,6);assert.deepEqual(entry.unmapped,[]);
 assert.deepEqual(projectComponentsForView(project,'breadboard').reconciliationItems,[]);assert.deepEqual(projectComponentsForView(project,'schematic').reconciliationItems,[]);assert.deepEqual(projectComponentsForView(project,'pcb').reconciliationItems,[]);
 assert.deepEqual(project.pcbFabrication.nonPhysicalItems.map(item=>item.reference),['GND']);assert.equal(validateBreadboardTopology(project,{getPartPins:id=>findLibraryPart(id)?.pins??[]}).state,'complete');assert.equal(validateBreadboardAssembly(project,{getPartPins:id=>findLibraryPart(id)?.pins??[]}).state,'complete');
 assert.equal(validatePcbFabrication(project).status,'passed');assert.equal(runProjectAnalysis(project).result.outputVoltage,2.25);
 assert.deepEqual(project.pcbFabrication.physicalEvidence.map(item=>item.manufacturerPartNumber),['TSW-102-07-T-S','MRS25000C3001FCT00','MRS25000C1001FCT00']);
 const exported=exportPcbFabrication(project);assert.equal(exported.status,'passed');assert.match(exported.files['BOM.csv'],/MRS25000C3001FCT00/);assert.match(exported.files['board-F_Cu.gbr'],/X/);
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="resistor-bottom-1"/);assert.match(renderBreadboardAssemblySvg(project),/R1|resistor-top-1/);
});
test('12 V parallel load maps sourced resistors and routes its PCB',async()=>{
 const entry=index.entries.find(item=>item.file==='010-parallel-load-12v.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/010-parallel-load-12v.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,4);assert.equal(entry.pcbPads,8);assert.deepEqual(entry.unmapped,[]);
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.deepEqual(project.pcbFabrication.nonPhysicalItems.map(item=>item.reference),['GND']);assert.equal(validatePcbFabrication(project).status,'passed');assert.equal(runProjectAnalysis(project).state,'complete');
 assert.deepEqual(project.pcbFabrication.physicalEvidence.map(item=>item.manufacturerPartNumber),['TSW-102-07-T-S','MRS25000C1001FCT00','MRS25000C2001FCT00','MRS25000C3001FCT00']);
 const exported=exportPcbFabrication(project);assert.equal(exported.status,'passed');assert.match(exported.files['BOM.csv'],/MRS25000C3001FCT00/);assert.match(exported.files['board-F_Cu.gbr'],/M02\*/);
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="resistor-branch-1"/);assert.ok(renderBreadboardAssemblySvg(project).includes('resistor-branch-1'));
});
test('5 V pushbutton LED reconciles its breadboard, PCB, scope, and fabrication exports',async()=>{
 const entry=index.entries.find(item=>item.file==='003-pushbutton-led.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/003-pushbutton-led.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,5);assert.equal(entry.pcbPads,12);assert.deepEqual(entry.unmapped,[]);
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 const assembly=validateBreadboardAssembly(project,{getPartPins});assert.equal(assembly.state,'complete');assert.equal(assembly.pigtailCount,4);
 assert.equal(validatePcbFabrication(project).status,'passed');
 const open=runProjectAnalysis(project);assert.equal(open.state,'complete');assert.equal(open.result.ledOn,false);assert.equal(open.scopeDcRecording.nodes.LED_A,0);
 const pressedProject=structuredClone(project);pressedProject.components.find(item=>item.instanceId==='switch-1').value='Pressed';
 const pressed=runProjectAnalysis(pressedProject);assert.equal(pressed.state,'complete');assert.equal(pressed.result.ledOn,true);assert.ok(Math.abs(pressed.scopeDcRecording.nodes.LED_A-2)<1e-12);
 const disconnected=structuredClone(project);disconnected.nets.find(net=>net.id==='LED_A').endpoints=['led-1:A'];
 const failed=runProjectAnalysis(disconnected);assert.equal(failed.state,'blocked');assert.match(failed.message,/series resistor between SW_OUT and LED_A/);assert.match(failed.message,/connect SW_OUT to GND/);assert.equal(failed.scopeDcRecording,undefined);
 const exported=exportPcbFabrication(project);assert.equal(exported.status,'passed');assert.match(exported.files['BOM.csv'],/B3F-1000/);assert.match(exported.files['board-F_Cu.gbr'],/X/);assert.match(exported.files['board-PTH.drl'],/T01/);
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="switch-1"/);
 assert.match(renderBreadboardAssemblySvg(project),/external-pushbutton/);assert.match(renderBreadboardAssemblySvg(project),/axial-led/);
});
test('latching SPDT LED maps the sourced slide switch across breadboard and PCB',async()=>{
 const entry=index.entries.find(item=>item.file==='004-latching-led-switch.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/004-latching-led-switch.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,4);assert.equal(entry.pcbPads,9);assert.deepEqual(entry.unmapped,[]);
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.equal(validatePcbFabrication(project).status,'passed');
 const positionA=runProjectAnalysis(project);assert.equal(positionA.state,'complete');assert.equal(positionA.result.ledOn,true);assert.ok(Math.abs(positionA.scopeDcRecording.nodes.LED_A-2)<1e-12);
 const positionBProject=structuredClone(project);positionBProject.components.find(item=>item.instanceId==='switch-1').value='Position B';
 const positionB=runProjectAnalysis(positionBProject);assert.equal(positionB.state,'complete');assert.equal(positionB.result.ledOn,false);assert.equal(positionB.scopeDcRecording.nodes.LED_A,0);
 const disconnected=structuredClone(project);disconnected.nets.find(net=>net.id==='SW_OUT').endpoints=['resistor-1:1'];
 const failed=runProjectAnalysis(disconnected);assert.equal(failed.state,'blocked');assert.match(failed.message,/COM through the series resistor and LED/);assert.equal(failed.scopeDcRecording,undefined);
 const exported=exportPcbFabrication(project);assert.equal(exported.status,'passed');assert.match(exported.files['BOM.csv'],/EG1218/);assert.match(exported.files['board-F_Cu.gbr'],/X/);assert.match(exported.files['board-PTH.drl'],/T01/);
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="switch-1"/);assert.match(renderBreadboardAssemblySvg(project),/slide-switch/);
});
test('PWM LED dimmer carries a source-backed physical PCB map without changing its ideal analysis',async()=>{
 const entry=index.entries.find(item=>item.file==='005-pwm-led-dimmer.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/005-pwm-led-dimmer.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,4);assert.equal(entry.pcbPads,10);
 assert.deepEqual(entry.unmapped,[]);assert.deepEqual(projectComponentsForView(project,'pcb').reconciliationItems,[]);
 assert.deepEqual(project.pcbFabrication.nonPhysicalItems.map(item=>item.reference),['PWM1','GND']);
 assert.equal(validatePcbFabrication(project).status,'passed');
 assert.equal(runProjectAnalysis(project).result.kind,'pwm-led-average');
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="mosfet-1"/);
 assert.deepEqual(project.pcbFabrication.physicalEvidence.map(item=>item.reference),['J1','R1','D1','Q1']);
 assert.ok(project.pcbFabrication.fabricationNotes.some(note=>/not a manufacturing DRC/.test(note)));
 assert.match(project.pcbFabrication.fabricationNotes.at(-1),/SOT-23-to-2.54 mm through-hole breakout adapter/);
});
test('5 V RC step response reconciles its polarized capacitor, BB400 assembly, scope and PCB exports',async()=>{
 const entry=index.entries.find(item=>item.file==='005-rc-step-response.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/005-rc-step-response.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,3);assert.equal(entry.pcbPads,6);assert.equal(entry.pcbRoutes,3);assert.deepEqual(entry.unmapped,[]);
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.equal(validatePcbFabrication(project).status,'passed');
 const analysis=runProjectAnalysis(project);assert.equal(analysis.state,'complete');assert.equal(analysis.result.kind,'rc-step-response');
 assert.equal(analysis.scopeRecording.preferredNet,'RC_NODE');assert.equal(analysis.scopeRecording.samples.length,501);
 assert.equal(analysis.scopeRecording.samples[0].nodeVoltages.RC_NODE,0);assert.ok(analysis.scopeRecording.samples.at(-1).nodeVoltages.RC_NODE>4.9);
 assert.equal(project.pcbFabrication.physicalEvidence.find(item=>item.reference==='C1').pinMapping['1'],'positive / RC_NODE');
 assert.match(project.pcbFabrication.parts.find(item=>item.reference==='C1').sourceUrl,/panasonic\.com/);
 const disconnected=structuredClone(project);disconnected.nets.find(net=>net.id==='RC_NODE').endpoints=['resistor-1:2'];
 const failed=runProjectAnalysis(disconnected);assert.equal(failed.state,'blocked');assert.match(failed.message,/source positive → resistor → capacitor → ground/);assert.equal(failed.scopeRecording,undefined);
 const exported=exportPcbFabrication(project);assert.equal(exported.status,'passed');assert.match(exported.files['BOM.csv'],/ECA1VMH101I/);assert.match(exported.files['board-F_Cu.gbr'],/X/);assert.match(exported.files['board-PTH.drl'],/T01/);
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="capacitor-1"/);assert.match(renderBreadboardAssemblySvg(project),/radial-capacitor/);
});
test('switched RC example maps the switch and polarized capacitor across views and exports',async()=>{
 const entry=index.entries.find(item=>item.file==='011-rc-charge-discharge.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/011-rc-charge-discharge.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');
 assert.deepEqual(entry.unmapped,[]);
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.deepEqual(projectComponentsForView(project,'schematic').components.map(part=>part.instanceId),project.components.map(part=>part.instanceId));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.equal(validatePcbFabrication(project).status,'passed');
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/EG1218/);
 assert.match(exported.files['BOM.csv'],/ECA1VMH101I/);
 assert.match(exported.files['board-F_Cu.gbr'],/M02\*/);
 assert.match(exported.files['board-PTH.drl'],/T01/);
 assert.match(renderBreadboardAssemblySvg(project),/radial-capacitor/);
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="switch-1"/);
 const analysis=runProjectAnalysis(project);
 assert.equal(analysis.state,'complete');
 assert.equal(analysis.scopeRecording.preferredNet,'RC_NODE');
 assert.equal(analysis.scopeRecording.samples[0].nodeVoltages.RC_NODE,0);
 assert.ok(analysis.scopeRecording.samples.at(-1).nodeVoltages.RC_NODE>4.9);
});
test('RC low-pass uses a mapped bipolar capacitor and a model-backed cutoff trace',async()=>{
 const entry=index.entries.find(item=>item.file==='012-rc-low-pass.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/012-rc-low-pass.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');
 assert.deepEqual(entry.unmapped,[]);
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(projectComponentsForView(project,'schematic').components.length,4);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.equal(validatePcbFabrication(project).status,'passed');
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/UES1E101MPM/);
 assert.match(exported.files['board-F_Cu.gbr'],/M02\*/);
 assert.match(exported.files['board-PTH.drl'],/T01/);
 const analysis=runProjectAnalysis(project);
 assert.equal(analysis.state,'complete');
 const scope=analysis.scopeRecording;
 assert.equal(scope.preferredNet,'FILTER_OUT');
 assert.equal(scope.samples.length,481);
 assert.ok(Math.abs(scope.samples[0].nodeVoltages.FILTER_OUT+0.5)<1e-9);
 assert.ok(Math.abs(Math.max(...scope.samples.map(sample=>sample.nodeVoltages.FILTER_OUT))-Math.SQRT1_2)<1e-9);
});
test('RC high-pass maps its series capacitor and output resistor across physical views',async()=>{
 const entry=index.entries.find(item=>item.file==='013-rc-high-pass.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/013-rc-high-pass.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');
 assert.deepEqual(entry.unmapped,[]);
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(projectComponentsForView(project,'schematic').components.length,4);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.equal(validatePcbFabrication(project).status,'passed');
 const exports=exportPcbFabrication(project);
 assert.equal(exports.status,'passed');
 assert.match(exports.files['BOM.csv'],/UES1E101MPM/);
 assert.match(exports.files['board-F_Cu.gbr'],/M02\*/);
 assert.match(exports.files['board-PTH.drl'],/T01/);
 const analysis=runProjectAnalysis(project);
 assert.equal(analysis.state,'complete');
 assert.equal(analysis.scopeRecording.preferredNet,'HP_OUT');
 assert.ok(Math.abs(analysis.scopeRecording.samples[0].nodeVoltages.HP_OUT-0.5)<1e-9);
});
test('passive tone control preserves the rheostat wiper and isolates the unused terminal',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/014-passive-tone-control.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.match(renderBreadboardAssemblySvg(project),/RP1 unused terminal at F9/);
 const shorted=structuredClone(project);
 shorted.breadboard.jumpers.push({from:'J9',to:'BM9'});
 assert.ok(validateBreadboardAssembly(shorted,{getPartPins}).errors.some(issue=>issue.code==='BREADBOARD_ASSEMBLY_NO_CONNECT'));
 const pads=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='pot-1');
 assert.deepEqual(pads.map(pad=>[pad.number,pad.netId]),[['1','INPUT'],['2','OUTPUT'],['3','NC']]);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/3296W-1-103LF/);
 assert.match(exported.files['BOM.csv'],/B32529C1104K189/);
 assert.match(exported.files['board-F_Cu.gbr'],/M02\*/);
 assert.match(exported.files['board-PTH.drl'],/T01/);
 const analysis=runProjectAnalysis(project);
 assert.equal(analysis.state,'complete');
 assert.equal(analysis.scopeRecording.preferredNet,'OUTPUT');
});
test('full-wave bridge keeps the floating AC input separate from the rectified return',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/015-bridge-rectifier.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 const assembly=validateBreadboardAssembly(project,{getPartPins});
 assert.equal(assembly.state,'complete');
 assert.equal(assembly.pigtailCount,6);
 const bridgePads=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='bridge-1');
 assert.deepEqual(bridgePads.map(pad=>[pad.pin,pad.netId]),[['POS','RECT_POS'],['AC1','AC1'],['AC2','AC2'],['NEG','RECT_NEG']]);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/Vishay_W0G_4pin/);
 assert.match(exported.files['board-F_Cu.gbr'],/M02\*/);
 assert.match(exported.files['board-PTH.drl'],/T01/);
 const analysis=runProjectAnalysis(project);
 assert.equal(analysis.state,'complete');
 assert.equal(analysis.scopeRecording.preferredNet,'RECT_POS');
 assert.ok(analysis.scopeRecording.samples.every(sample=>sample.nodeVoltages.RECT_NEG===0&&sample.nodeVoltages.RECT_POS>=0));
 assert.ok(analysis.scopeRecording.samples.some(sample=>sample.nodeVoltages.RECT_POS>15));
});
test('reservoir capacitor preserves polarity in both physical layouts and the scope recording',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/016-smoothing-capacitor.adigun.json',import.meta.url),'utf8'));
 const pins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins:pins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins:pins}).state,'complete');
 const capacitorPads=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='capacitor-1');
 assert.deepEqual(capacitorPads.map(pad=>[pad.number,pad.netId]),[['1','RECT_POS'],['2','RECT_NEG']]);
 assert.match(renderBreadboardAssemblySvg(project),/EEUFR1V102B/);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/EEUFR1V102B/);
 assert.match(exported.files['board-F_Cu.gbr'],/M02\*/);
 assert.match(exported.files['board-PTH.drl'],/T01/);
 const analysis=runProjectAnalysis(project);
 assert.equal(analysis.state,'complete');
 assert.equal(analysis.scopeRecording.preferredNet,'RECT_POS');
 assert.ok(analysis.scopeRecording.samples.some(sample=>sample.nodeVoltages.RECT_POS>15));
});
test('Zener shunt regulator maps the banded cathode to the clamped output',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/017-zener-shunt-regulator.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const diode=project.breadboard.assembly.packages.find(part=>part.reference==='DZ1');
 assert.deepEqual(diode.pins.map(pin=>[pin.pin,pin.hole]),[['A','F14'],['K','F18']]);
 const pads=project.pcbFabrication.pads.filter(pad=>pad.reference==='DZ1');
 assert.deepEqual(pads.map(pad=>[pad.number,pad.netId]),[['K','VOUT'],['A','GND']]);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/BZX55C5V1-TAP/);
 assert.match(exported.files['board-F_Cu.gbr'],/M02\*/);
 assert.match(exported.files['board-PTH.drl'],/T01/);
 const analysis=runProjectAnalysis(project);
 assert.equal(analysis.state,'complete');
 assert.equal(analysis.result.outputVoltage,5.1);
});
test('TVS surge clamp maps the pulse resistor and banded TVS with pigtails and plated holes',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/018-tvs-surge-clamp.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 const assembly=validateBreadboardAssembly(project,{getPartPins});
 assert.equal(assembly.state,'complete');
 assert.equal(assembly.pigtailCount,6);
 const tvsPads=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='tvs-1');
 assert.deepEqual(tvsPads.map(pad=>[pad.number,pad.netId,pad.drillMm]),[['K','VOUT',1.3],['A','GND',1.3]]);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/AC05000001009JAC00/);
 assert.match(exported.files['BOM.csv'],/1\.5KE18A-E3/);
 assert.match(exported.files['board-F_Cu.gbr'],/M02\*/);
 assert.match(exported.files['board-PTH.drl'],/C1\.3/);
});
test('NTC temperature divider maps the source-backed thermistor in series with its load',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/019-ntc-temperature-divider.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.match(renderBreadboardAssemblySvg(project),/radial-ntc/);
 const pads=project.pcbFabrication.pads.filter(pad=>pad.reference==='TH1');
 assert.deepEqual(pads.map(pad=>[pad.number,pad.netId]),[['1','VCC'],['2','VOUT']]);
 assert.equal(pads[1].xMm-pads[0].xMm,2.5);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/B57891M0103J000/);
 assert.match(exported.files['board-F_Cu.gbr'],/M02\*/);
 assert.match(exported.files['board-PTH.drl'],/T01/);
 const analysis=runProjectAnalysis(project);
 assert.equal(analysis.state,'complete');
 assert.equal(analysis.result.outputVoltage,2.5);
});
test('physical LDR night light wires the comparator reference and isolates unused PDIP terminals',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/020-ldr-night-light.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const comparator=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='comparator-1');
 assert.deepEqual(comparator.map(pad=>[pad.number,pad.netId]),[['1','NC'],['2','SENSE'],['3','VREF'],['4','GND'],['5','NC'],['6','OUT'],['7','VCC'],['8','NC']]);
 const previous=[];
 for(const net of project.nets)for(const [first,second] of netEdges(net)){
  const route=routeSchematicConnection(project.components,findLibraryPart,first,second,previous.filter(item=>item.id!==net.id).map(item=>item.route),net.id==='VCC'?'top':net.id==='GND'?'bottom':null);
  assert.ok(route?.every(point=>point.x>=0&&point.x<=680&&point.y>=0&&point.y<=300),`${net.id} route from ${first} to ${second} must fit the schematic print canvas`);
  previous.push({id:net.id,route});
 }
 const bridged=structuredClone(project);
 bridged.breadboard.jumpers.push({from:'J12',to:'BM12'});
 assert.ok(validateBreadboardAssembly(bridged,{getPartPins}).errors.some(issue=>issue.code==='BREADBOARD_ASSEMBLY_NO_CONNECT'));
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/MCP6541-I_P/);
 for(const layer of ['F','B'])assert.match(exported.files[`board-${layer}_Cu.gbr`],/M02\*/);
 assert.match(exported.files['board-PTH.drl'],/T01/);
});
test('555 blinker maps all timer pins and its supply bypass to exported PCB pads',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/021-555-astable-blinker.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.deepEqual(project.pcbFabrication.pads.filter(pad=>pad.reference==='U1').map(pad=>pad.netId),['GND','TIMING','OUTPUT','VCC','CONTROL','TIMING','DISCHARGE','VCC']);
 assert.deepEqual(project.pcbFabrication.pads.filter(pad=>pad.reference==='CBYP').map(pad=>pad.netId),['VCC','GND']);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/NE555P/);
 assert.match(exported.files['BOM.csv'],/B32529C1104K189/);
 for(const layer of ['F','B'])assert.match(exported.files[`board-${layer}_Cu.gbr`],/M02\*/);
 assert.match(exported.files['board-PTH.drl'],/T01/);
 const analysis=runProjectAnalysis(project);
 assert.equal(analysis.state,'complete');
 assert.equal(analysis.scopeRecording.preferredNet,'OUTPUT');
 assert.ok(analysis.scopeRecording.samples.some(sample=>sample.nodeVoltages.OUTPUT===5));
 assert.ok(analysis.scopeRecording.samples.some(sample=>sample.nodeVoltages.OUTPUT===0));
});
test('555 one-shot maps both trigger contact pairs and produces a single triggered pulse',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/022-555-monostable.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const switchPads=project.pcbFabrication.pads.filter(pad=>pad.reference==='SW1');
 assert.deepEqual(switchPads.map(pad=>[pad.number,pad.netId]),[['2','TRIGGER'],['4','TRIGGER'],['1','GND'],['3','GND']]);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/B3F-1000/);
 assert.match(exported.files['BOM.csv'],/EEUFR1H100/);
 for(const layer of ['F','B'])assert.match(exported.files[`board-${layer}_Cu.gbr`],/M02\*/);
 const idle=runProjectAnalysis(project);
 assert.equal(idle.state,'complete');
 assert.equal(idle.result.pulseCount,0);
 project.components.find(part=>part.instanceId==='trigger-1').value='Pressed';
 const triggered=runProjectAnalysis(project);
 assert.equal(triggered.state,'complete');
 assert.equal(triggered.result.pulseCount,1);
 assert.ok(Math.abs(triggered.result.pulseWidthS-1.1)<1e-9);
 assert.equal(triggered.scopeRecording.preferredNet,'OUT');
});
test('Wien bridge keeps the limiter diodes antiparallel across physical views',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/040-wien-bridge-oscillator.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const {pinHoles}=project.breadboard;
 assert.equal(pinHoles['limiter-1:K'],'A28');
 assert.equal(pinHoles['limiter-2:K'],'E24');
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 const cathodeNet=ref=>project.pcbFabrication.pads.find(pad=>pad.reference===ref&&pad.pin==='K').netId;
 assert.equal(cathodeNet('D1'),'INVERTING');
 assert.equal(cathodeNet('D2'),'OUTPUT');
 assert.equal(exportPcbFabrication(project).status,'passed');
 const analysis=runProjectAnalysis(project);
 assert.equal(analysis.result.kind,'wien-bridge-oscillator');
 assert.equal(analysis.scopeRecording,undefined);
});
test('active low-pass routes the filter node independently of input and feedback',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/039-active-low-pass.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const pads=ref=>project.pcbFabrication.pads.filter(pad=>pad.reference===ref).map(pad=>pad.netId);
 assert.deepEqual(pads('RIN'),['INPUT','FILTERED_INPUT']);
 assert.deepEqual(pads('C1'),['FILTERED_INPUT','GND']);
 assert.equal(exportPcbFabrication(project).status,'passed');
 const result=runProjectAnalysis(project);
 assert.equal(result.result.passbandGain,2);
 assert.ok(Math.abs(result.result.cutoffHz-1591.5494309189535)<1e-9);
 assert.equal(result.scopeRecording.preferredNet,'OUTPUT');
});
test('LM386 board isolates the gain pins and connects the polarized output and wired speaker',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/038-audio-power-amplifier.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const pads=ref=>project.pcbFabrication.pads.filter(pad=>pad.reference===ref).map(pad=>pad.netId);
 assert.deepEqual(pads('U1'),['NC','GND','AUDIO_IN','GND','AMP_OUT','VCC','BYPASS','NC']);
 assert.deepEqual(pads('COUT'),['AMP_OUT','SPEAKER_PLUS']);
 assert.deepEqual(pads('SP1'),['SPEAKER_PLUS','GND']);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/AS04008CO-WR-R/);
});
test('electret preamp routes its two-pin capsule, midpoint bypass and MCP601',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/037-electret-audio-preamp.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const pads=ref=>project.pcbFabrication.pads.filter(pad=>pad.reference===ref);
 assert.deepEqual(pads('MIC1').map(pad=>[pad.number,pad.netId]),[['1','MIC_OUT'],['2','GND']]);
 assert.ok(Math.abs(pads('MIC1')[1].xMm-pads('MIC1')[0].xMm-2.5)<1e-9);
 assert.deepEqual(pads('CREF').map(pad=>pad.netId),['VREF','GND']);
 assert.deepEqual(pads('U1').map(pad=>pad.netId),['NC','INVERTING','AMP_IN','GND','NC','OUTPUT','VCC','NC']);
 const result=exportPcbFabrication(project);
 assert.equal(result.status,'passed');
 assert.match(result.files['BOM.csv'],/AOM-4544P-2-R/);
});
test('H-bridge routes the static test load and scopes only determined nodes',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/036-hbridge-dc-motor.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.equal(exportPcbFabrication(project).status,'passed');
 const forward=runProjectAnalysis(project);
 assert.ok(Math.abs(forward.result.motorCurrentA-12/390.2)<1e-12);
 assert.equal(forward.scopeDcRecording.nodes.MOTOR_A,forward.result.leftOutputVoltageV);
 assert.equal(forward.scopeDcRecording.nodes.MOTOR_B,forward.result.rightOutputVoltageV);
 const setGate=(id,value)=>{project.components.find(c=>c.instanceId===id).value=value;};
 setGate('gate-ll','5 V');
 const overlap=runProjectAnalysis(project);
 assert.equal(overlap.state,'blocked');
 assert.equal(overlap.scopeDcRecording,undefined);
 setGate('gate-ll','0 V');
 setGate('gate-lh','12 V');
 setGate('gate-rl','0 V');
 const coast=runProjectAnalysis(project);
 assert.equal(coast.result.direction,'coast');
 assert.equal(Object.hasOwn(coast.scopeDcRecording.nodes,'MOTOR_A'),false);
 assert.equal(Object.hasOwn(coast.scopeDcRecording.nodes,'MOTOR_B'),false);
});
test('NPN relay maps the two real coil terminals and isolates remaining pads',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/035-npn-relay-driver.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const pads=project.pcbFabrication.pads.filter(pad=>pad.reference==='K1');
 assert.deepEqual(pads.map(pad=>[pad.number,pad.netId]),[['1','NC'],['2','VCC'],['5','NC'],['6','NC'],['9','COLLECTOR'],['10','NC']]);
 assert.equal(exportPcbFabrication(project).status,'passed');
 const on=runProjectAnalysis(project);
 assert.equal(on.result.coilResistanceOhm,960);
 assert.equal(on.scopeDcRecording.nodes.COLLECTOR,0.2);
 project.components.find(part=>part.instanceId==='control').value='0 V';
 assert.equal(runProjectAnalysis(project).scopeDcRecording.nodes.COLLECTOR,12);
});
test('PMOS switch maps the power load and scopes active-low gate drive',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/034-pmos-high-side-switch.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.deepEqual(project.pcbFabrication.pads.filter(pad=>pad.reference==='Q1').map(pad=>pad.netId),['GATE','LOAD','VCC']);
 const [inputPin,returnPin]=project.pcbFabrication.pads.filter(pad=>pad.reference==='J2');
 assert.equal(inputPin.xMm,returnPin.xMm);
 assert.ok(Math.abs(returnPin.yMm-inputPin.yMm-2.54)<1e-9);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/AC05000001200JAC00/);
 const control=project.components.find(part=>part.instanceId==='gate-drive');
 for(const [voltage,expected] of [[0,true],[12,false]]){
  control.value=`${voltage} V`;
  const analysis=runProjectAnalysis(project);
  assert.equal(analysis.result.switchOn,expected);
  assert.equal(analysis.scopeDcRecording.nodes.GATE,voltage);
  assert.equal(analysis.scopeDcRecording.nodes.LOAD,analysis.result.loadVoltage);
 }
 control.value='13 V';
 assert.equal(runProjectAnalysis(project).scopeDcRecording,undefined);
});
test('NMOS coil driver maps the physical switch and stays below the selected coil rating',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/033-nmos-low-side-switch.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const pads=project.pcbFabrication.pads;
 assert.deepEqual(pads.filter(pad=>pad.reference==='Q1').map(pad=>pad.netId),['GATE','DRAIN','GND']);
 assert.deepEqual(pads.filter(pad=>pad.reference==='D1').map(pad=>pad.netId),['DRAIN','VCC']);
 assert.equal(exportPcbFabrication(project).status,'passed');
 assert.ok(runProjectAnalysis(project).result.loadCurrentA<0.05);
});
test('emitter follower maps the 2N3904BU and scopes cutoff and loaded output',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/032-emitter-follower.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.deepEqual(project.pcbFabrication.pads.filter(pad=>pad.reference==='Q1').map(pad=>pad.netId),['OUTPUT','INPUT','VCC']);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/2N3904BU/);
 const input=project.components.find(component=>component.instanceId==='input');
 for(const [voltage,expected] of [[0.5,0],[2.5,1.8],[5,4.3]]){
  input.value=`${voltage} V`;
  const {scopeDcRecording}=runProjectAnalysis(project);
  assert.equal(scopeDcRecording.preferredNet,'OUTPUT');
  assert.ok(Math.abs(scopeDcRecording.nodes.OUTPUT-expected)<1e-9);
 }
});
test('common-emitter amplifier maps the 2N3904BU and the polarized coupling capacitors',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/031-transistor-common-emitter.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const netOf=(id,pin)=>project.pcbFabrication.pads.find(pad=>pad.instanceId===id&&pad.number===pin)?.netId;
 assert.deepEqual(['1','2','3'].map(pin=>netOf('q1',pin)),['EMITTER','BASE','COLLECTOR']);
 assert.equal(netOf('cin','2'),'BASE');
 assert.equal(netOf('cout','1'),'COLLECTOR');
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/2N3904BU/);
 const result=runProjectAnalysis(project);
 assert.equal(result.scopeRecording.preferredNet,'OUTPUT_AC');
 assert.ok(result.scopeRecording.samples.some(sample=>sample.nodeVoltages.INPUT_AC>0&&sample.nodeVoltages.OUTPUT_AC<0));
});
test('reference buffer maps its load and scopes the fixed DC output over a load sweep',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/030-reference-buffer.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.equal(exportPcbFabrication(project).status,'passed');
 const load=project.components.find(component=>component.instanceId==='load');
 for(const [value,resistance] of [['1 kΩ',1000],['10 kΩ',10000],['100 kΩ',100000]]){
  load.value=value;
  const result=runProjectAnalysis(project);
  assert.equal(result.result.loadCurrentA,2.5/resistance);
  assert.equal(result.scopeDcRecording.preferredNet,'OUTPUT');
  assert.deepEqual(result.scopeDcRecording.nodes,{GND:0,REFERENCE:2.5,OUTPUT:2.5,VPLUS:12,VMINUS:-12});
 }
});
test('window comparator grounds unused gate inputs and exports a connected two-layer board',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/029-window-comparator.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const pads=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='and');
 assert.deepEqual(pads.map(pad=>pad.netId),['LOWER_OK','UPPER_OK','WINDOW_OUT','GND','GND','NC','GND','NC','GND','GND','NC','GND','GND','VCC']);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/SN74HC08N/);
});
test('Schmitt trigger maps positive feedback and scopes only determined levels',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/028-schmitt-trigger.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const pads=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='schmitt');
 assert.deepEqual(pads.map(pad=>pad.netId),['NC','REFERENCE','SENSE_PLUS','GND','NC','OUT','VCC','NC']);
 assert.equal(exportPcbFabrication(project).status,'passed');
 const signal=project.components.find(part=>part.instanceId==='signal');
 assert.equal(runProjectAnalysis(project).scopeRecording.samples[0].nodeVoltages.OUT,0);
 signal.value='3.1 V';
 assert.equal(runProjectAnalysis(project).scopeRecording.samples[0].nodeVoltages.OUT,5);
 signal.value='2.7 V';
 const unresolved=runProjectAnalysis(project);
 assert.equal(unresolved.result.outputState,'memory-dependent');
 assert.deepEqual(unresolved.scopeRecording.samples[0].nodeVoltages,{VCC:5,GND:0,INPUT:2.7,REFERENCE:2.5});
});
test('threshold indicator maps the push-pull comparator and scopes both settled states',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/027-comparator-threshold.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const pads=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='comparator');
 assert.deepEqual(pads.map(pad=>pad.netId),['NC','THRESHOLD','SIGNAL','GND','NC','CMP_OUT','VCC','NC']);
 assert.equal(exportPcbFabrication(project).status,'passed');
 const low=runProjectAnalysis(project);
 assert.equal(low.scopeRecording.samples[0].nodeVoltages.CMP_OUT,0);
 project.components.find(part=>part.instanceId==='signal').value='2.6 V';
 const high=runProjectAnalysis(project);
 assert.equal(high.scopeRecording.samples[0].nodeVoltages.CMP_OUT,5);
 assert.equal(high.result.ledCurrentA,3/2200);
});
test('voltage follower routes the TL071CP output directly to the inverting input',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/026-opamp-voltage-follower.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const pads=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='opamp');
 assert.deepEqual(pads.map(pad=>pad.netId),['NC','OUTPUT','INPUT','VMINUS','NC','OUTPUT','VPLUS','NC']);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/TL071CP/);
 assert.deepEqual(runProjectAnalysis(project).scopeRecording.samples[30].nodeVoltages,{GND:0,INPUT:0.2,OUTPUT:0.2});
});
test('inverting amplifier routes the TL071CP summing node and grounds its positive input',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/025-opamp-inverting.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const pads=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='opamp');
 assert.deepEqual(pads.map(pad=>pad.netId),['NC','SUMMING','GND','VMINUS','NC','OUTPUT','VPLUS','NC']);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/MRS25000C2002FCT00/);
 const result=runProjectAnalysis(project);
 assert.equal(result.result.gainVPerV,-2);
 assert.deepEqual(result.scopeRecording.samples[30].nodeVoltages,{GND:0,INPUT:0.1,OUTPUT:-0.2});
});
test('non-inverting amplifier maps the TL071CP with isolated trim and unused pins',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/024-opamp-noninverting.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const pads=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='opamp');
 assert.deepEqual(pads.map(pad=>pad.netId),['NC','FEEDBACK','INPUT','VMINUS','NC','OUTPUT','VPLUS','NC']);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/TL071CP/);
 for(const layer of ['F','B'])assert.match(exported.files[`board-${layer}_Cu.gbr`],/M02\*/);
});
test('NE556 example uses the exact 14-pin package and exports both routed copper layers',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/023-556-dual-timer.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const timerPads=project.pcbFabrication.pads.filter(pad=>pad.instanceId==='timer-1');
 assert.deepEqual(timerPads.map(pad=>pad.netId),[
  'A_DISCHARGE','A_TIMING','A_CONTROL','VCC','A_OUTPUT','A_TIMING','GND',
  'B_TIMING','B_OUTPUT','VCC','B_CONTROL','B_TIMING','B_DISCHARGE','VCC'
 ]);
 const exported=exportPcbFabrication(project);
 assert.equal(exported.status,'passed');
 assert.match(exported.files['BOM.csv'],/NE556N/);
 assert.match(exported.files['board-PTH.drl'],/T01/);
 for(const layer of ['F','B'])assert.match(exported.files[`board-${layer}_Cu.gbr`],/M02\*/);
});
test('5 V RL step response maps a current-rated radial inductor across BB400 and PCB',async()=>{
 const entry=index.entries.find(item=>item.file==='006-rl-step-response.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/006-rl-step-response.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,3);assert.equal(entry.pcbPads,6);assert.equal(entry.pcbRoutes,3);assert.deepEqual(entry.unmapped,[]);
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.equal(validatePcbFabrication(project).status,'passed');
 const analysis=runProjectAnalysis(project);assert.equal(analysis.state,'complete');assert.equal(analysis.result.kind,'rl-step-response');
 assert.ok(Math.abs(analysis.result.timeConstantS-1/1200)<1e-12);assert.equal(analysis.scopeRecording.preferredNet,'RL_NODE');assert.equal(analysis.scopeRecording.samples.length,501);
 assert.ok(analysis.result.samples.at(-1).currentA<0.05);assert.ok(analysis.result.samples.at(-1).currentA>0.041);
 const coil=project.pcbFabrication.physicalEvidence.find(item=>item.reference==='L1');assert.equal(coil.manufacturerPartNumber,'7447471104');assert.match(coil.package,/50 mA rated current/);
 const disconnected=structuredClone(project);disconnected.nets.find(net=>net.id==='RL_NODE').endpoints=['resistor-1:2'];
 const failed=runProjectAnalysis(disconnected);assert.equal(failed.state,'blocked');assert.match(failed.message,/resistor → inductor/);assert.equal(failed.scopeRecording,undefined);
 const exported=exportPcbFabrication(project);assert.equal(exported.status,'passed');assert.match(exported.files['BOM.csv'],/7447471104/);assert.match(exported.files['board-F_Cu.gbr'],/X/);assert.match(exported.files['board-PTH.drl'],/T01/);
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="inductor-1"/);assert.match(renderBreadboardAssemblySvg(project),/radial-inductor/);
});
test('5 V supercapacitor hold-up maps its BB400 assembly, scope and routed PCB',async()=>{
 const entry=index.entries.find(item=>item.file==='010-supercapacitor-hold-up.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/010-supercapacitor-hold-up.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,4);assert.equal(entry.pcbPads,8);assert.equal(entry.pcbRoutes,5);assert.deepEqual(entry.unmapped,[]);
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.equal(validatePcbFabrication(project).status,'passed');
 const analysis=runProjectAnalysis(project);assert.equal(analysis.state,'complete');assert.equal(analysis.result.kind,'supercap-hold-up');
 assert.equal(analysis.scopeRecording.preferredNet,'CAP_LOAD');assert.equal(analysis.scopeRecording.samples.length,501);
 assert.equal(project.components.find(component=>component.instanceId==='cap-1').value,'C 1 F; Vstart 4.7 V; Vmin 3 V; Vmax 5.5 V');
 const cap=project.pcbFabrication.physicalEvidence.find(item=>item.reference==='C1');assert.equal(cap.manufacturerPartNumber,'LP055105A');assert.match(cap.package,/maximum charge current 1.5 mA/);
 assert.match(project.breadboard.physicalNotes.join(' '),/1.5 mA/);assert.match(project.pcbFabrication.fabricationNotes.join(' '),/1.5 mA or less/);
 const disconnected=structuredClone(project);disconnected.nets.find(net=>net.id==='CAP_LOAD').endpoints=['diode-1:K'];
 const failed=runProjectAnalysis(disconnected);assert.equal(failed.state,'blocked');assert.equal(failed.scopeRecording,undefined);
 const exported=exportPcbFabrication(project);assert.equal(exported.status,'passed');assert.match(exported.files['BOM.csv'],/LP055105A/);assert.match(exported.files['board-F_Cu.gbr'],/X/);assert.match(exported.files['board-PTH.drl'],/T01/);
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="cap-1"/);assert.match(renderBreadboardAssemblySvg(project),/radial-capacitor/);
});
test('5 V Parallel Resistor Load exports its exact external supply, resistor pads and net routes',async()=>{
 const entry=index.entries.find(item=>item.file==='004-parallel-resistor-load.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/004-parallel-resistor-load.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,4);assert.equal(entry.pcbPads,8);
 assert.deepEqual(entry.unmapped,[]);assert.deepEqual(pcbCoverage(project).missing,[]);
 assert.deepEqual(project.pcbFabrication.nonPhysicalItems.map(item=>item.reference),['GND']);
 assert.equal(validatePcbFabrication(project).status,'passed');
 assert.equal(runProjectAnalysis(project).result.kind,'resistive-network');
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="resistor-branch-1"/);
 assert.deepEqual(project.pcbFabrication.physicalEvidence.map(item=>item.reference),['J1','R1','R2','R3']);
});
test('9 V Battery Discharge Monitor maps its TPS3710 across BB400 and routed fabrication views',async()=>{
 const entry=index.entries.find(item=>item.file==='006-battery-discharge-monitor.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/006-battery-discharge-monitor.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,7);assert.equal(entry.pcbPads,18);assert.ok(entry.pcbRoutes>0);
 assert.deepEqual(entry.unmapped,[]);assert.deepEqual(projectComponentsForView(project,'breadboard').reconciliationItems,[]);assert.deepEqual(projectComponentsForView(project,'pcb').reconciliationItems,[]);
 assert.equal(validateProject(project).valid,true);assert.equal(runProjectAnalysis(project).result.tripBatteryVoltage,7.6);
 assert.equal(validatePcbFabrication(project).status,'passed');assert.equal(exportPcbFabrication(project).status,'passed');
 assert.deepEqual(project.pcbFabrication.nonPhysicalItems.map(item=>item.reference),['GND']);
 assert.deepEqual(project.pcbFabrication.physicalEvidence.map(item=>item.reference),['J1','R1','R2','U1','R3','D1','C1']);
 assert.equal(project.pcbFabrication.vias.length,6);assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="comparator-1"/);
});
test('230 V to 5 V linear supply keeps the simulated primary off hardware and maps the isolated low-voltage views',async()=>{
 const entry=index.entries.find(item=>item.file==='007-linear-regulated-supply.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/007-linear-regulated-supply.adigun.json',import.meta.url),'utf8'));
 const pins=libraryId=>findLibraryPart(libraryId)?.pins??[];
 const components=Object.fromEntries(['breadboard','schematic','pcb'].map(view=>[view,projectComponentsForView(project,view)]));
 const topology=validateBreadboardTopology(project,{getPartPins:pins}),assembly=validateBreadboardAssembly(project,{getPartPins:pins});
 const analysis=runProjectAnalysis(project),drc=validatePcbFabrication(project),pack=exportPcbFabrication(project);
 assert.equal(validateProject(project).valid,true);
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,6);assert.equal(entry.pcbPads,15);assert.equal(entry.pcbRoutes,9);assert.deepEqual(entry.unmapped,[]);
 assert.ok(Object.values(components).every(view=>view.reconciliationItems.length===0));
 assert.equal(topology.state,'complete',JSON.stringify(topology.warnings));assert.equal(assembly.state,'complete',JSON.stringify(assembly.errors));assert.equal(assembly.packageCount,6);
 assert.match(renderBreadboardAssemblySvg(project),/data-instance-id="bridge-1"/);
 assert.deepEqual(project.breadboard.nonPhysicalItems.map(item=>item.reference),['VAC1','T1','GND']);
 assert.deepEqual(project.pcbFabrication.nonPhysicalItems.map(item=>item.reference),['VAC1','T1','GND']);
 assert.equal(analysis.state,'complete');assert.equal(analysis.result.outputVoltage,5);assert.equal(analysis.scopeDcRecording.nodes.DC_5V,5);
 const disconnectedInput=structuredClone(project);disconnectedInput.nets.find(net=>net.id==='SEC1').endpoints=disconnectedInput.nets.find(net=>net.id==='SEC1').endpoints.filter(endpoint=>endpoint!=='isolated-input-1:AC1');
 assert.equal(runProjectAnalysis(disconnectedInput).state,'blocked');
 assert.equal(drc.status,'passed',drc.errors.join('; '));assert.equal(pack.status,'passed');
 assert.match(project.pcbFabrication.fabricationNotes[0],/Never connect mains voltage/);
 assert.match(project.breadboard.physicalNotes[0],/Do not connect mains voltage/);
});
test('USB-powered LED maps its isolated 5 V breakout across the BB400 and routed PCB views',async()=>{
 const entry=index.entries.find(item=>item.file==='008-usb-powered-led.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/008-usb-powered-led.adigun.json',import.meta.url),'utf8'));
 const pins=libraryId=>findLibraryPart(libraryId)?.pins??[];
 const views=Object.fromEntries(['breadboard','schematic','pcb'].map(view=>[view,projectComponentsForView(project,view)]));
 const topology=validateBreadboardTopology(project,{getPartPins:pins}),assembly=validateBreadboardAssembly(project,{getPartPins:pins});
 const analysis=runProjectAnalysis(project),drc=validatePcbFabrication(project),pack=exportPcbFabrication(project);
 assert.equal(validateProject(project).valid,true);
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,4);assert.equal(entry.pcbPads,8);assert.equal(entry.pcbRoutes,4);assert.deepEqual(entry.unmapped,[]);
 assert.ok(Object.values(views).every(view=>view.reconciliationItems.length===0));
 assert.equal(topology.state,'complete',JSON.stringify(topology.warnings));assert.equal(assembly.state,'complete',JSON.stringify(assembly.errors));assert.equal(assembly.packageCount,4);
 assert.deepEqual(project.breadboard.jumpers,[{from:'A3',to:'A8'},{from:'A10',to:'A16'},{from:'A20',to:'A24'},{from:'A4',to:'A25'}]);
 assert.match(renderBreadboardAssemblySvg(project),/class="breadboard-ptc-body"/);
 assert.deepEqual(project.pcbFabrication.physicalEvidence.map(item=>item.reference),['J1','F1','R1','D1']);
 assert.deepEqual(project.pcbFabrication.nonPhysicalItems.map(item=>item.reference),['USB1','GND']);
 assert.equal(analysis.state,'complete',analysis.message);assert.equal(analysis.result.coldResistance,0.77);assert.ok(Math.abs(analysis.result.currentA-3/330.77)<1e-12);
 assert.equal(drc.status,'passed',drc.errors.join('; '));assert.equal(pack.status,'passed');
 assert.deepEqual(Object.keys(pack.files).sort(),['BOM.csv','board-B_Cu.gbr','board-Edge_Cuts.gbr','board-F_Cu.gbr','board-PTH.drl'].sort());
 const disconnected=structuredClone(project);disconnected.nets.find(net=>net.id==='USB_VBUS').endpoints=disconnected.nets.find(net=>net.id==='USB_VBUS').endpoints.filter(endpoint=>endpoint!=='usb-input-1:VUSB');
 assert.equal(runProjectAnalysis(disconnected).state,'blocked');assert.match(runProjectAnalysis(disconnected).message,/J1 VUSB/);
});
test('LM2577 boost example has a routed, source-backed PCB and exportable fabrication pack',async()=>{
 const entry=index.entries.find(item=>item.file==='102-boost-converter-baseline.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/102-boost-converter-baseline.adigun.json',import.meta.url),'utf8'));
 const analysis=runProjectAnalysis(project),drc=validatePcbFabrication(project),pack=exportPcbFabrication(project);
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.components,14);assert.equal(entry.pcbParts,12);assert.equal(entry.pcbPads,27);assert.equal(entry.pcbRoutes,20);
 assert.equal(drc.status,'passed',drc.errors.join('; '));assert.equal(pack.status,'passed');
 assert.deepEqual(Object.keys(pack.files).sort(),['BOM.csv','board-B_Cu.gbr','board-Edge_Cuts.gbr','board-F_Cu.gbr','board-PTH.drl'].sort());
 assert.equal(analysis.state,'complete',analysis.message);assert.equal(analysis.result.device,'LM2577T-ADJ/NOPB');assert.equal(analysis.result.outputVoltageV,11.931);
 assert.deepEqual(project.components.map(c=>['breadboard','schematic','pcb'].every(view=>Array.isArray(c.position[view]))).every(Boolean),true);
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="controller"/);
 assert.deepEqual(entry.unmapped.map(item=>item.reference).sort(),['GND','SCOPE1']);
 const controller=project.pcbFabrication.physicalEvidence.find(item=>item.reference==='U1');
 assert.deepEqual(controller.pinMapping,{'1':'COMP','2':'FB','3':'GND case/tab','4':'SWITCH','5':'VIN'});
});

test('Two-LED polarity indicator maps sourced LED branches across BB400 and routed PCB views',async()=>{
 const entry=index.entries.find(item=>item.file==='002-two-led-polarity-indicator.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/002-two-led-polarity-indicator.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,5);assert.equal(entry.pcbPads,10);assert.deepEqual(entry.unmapped,[]);
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 assert.deepEqual(project.pcbFabrication.nonPhysicalItems.map(item=>item.reference),['GND']);assert.equal(validatePcbFabrication(project).status,'passed');assert.equal(runProjectAnalysis(project).result.kind,'led-polarity-indicator');
 assert.deepEqual(project.pcbFabrication.physicalEvidence.map(item=>item.manufacturerPartNumber),['TSW-102-07-T-S','MRS25000C3300FCT00','LTL-307E-002A','MRS25000C3300FCT00','LTL-307G']);
 const exported=exportPcbFabrication(project);assert.equal(exported.status,'passed');assert.match(exported.files['BOM.csv'],/LTL-307G/);assert.match(exported.files['board-F_Cu.gbr'],/M02\*/);
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="led-green"/);assert.ok(renderBreadboardAssemblySvg(project).includes('led-green'));
});
test('Example 064 maps the LM35DZ, AVR and LCD connector in all three views',async()=>{
 const project=JSON.parse(await readFile(new URL('../examples/064-arduino-temperature-monitor.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(project,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(project,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(project,{getPartPins}).state,'complete');
 const parts=Object.fromEntries(project.pcbFabrication.physicalEvidence.map(item=>[item.reference,item]));
 assert.deepEqual(parts.TS1.pinMapping,{'1':'VCC','2':'SENSOR_OUT','3':'GND'});
 assert.deepEqual(parts.J2.pinMapping,{'1':'GND','2':'VCC','3':'LCD_DATA'});
 assert.equal(parts.U1.pinMapping['14'],'LCD_DATA');
 assert.equal(parts.U1.pinMapping['23'],'SENSOR_OUT');
 const drc=validatePcbFabrication(project),pack=exportPcbFabrication(project);
 assert.equal(drc.status,'passed',drc.errors.join('; '));
 assert.equal(pack.status,'passed');
 assert.deepEqual(Object.keys(pack.files).sort(),['BOM.csv','board-B_Cu.gbr','board-Edge_Cuts.gbr','board-F_Cu.gbr','board-PTH.drl'].sort());
});

test('Example 065 maps both off-board assemblies across breadboard, schematic and PCB',async()=>{
 const p=JSON.parse(await readFile(new URL('../examples/065-arduino-ultrasonic-ranger.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(p,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(p,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(p,{getPartPins}).state,'complete');
 const parts=Object.fromEntries(p.pcbFabrication.physicalEvidence.map(item=>[item.reference,item]));
 assert.deepEqual(parts.J2.pinMapping,{'1':'VCC','2':'TRIG','3':'ECHO','4':'GND'});
 assert.deepEqual(parts.J3.pinMapping,{'1':'GND','2':'VCC','3':'OLED_SDA','4':'OLED_SCL'});
 assert.equal(parts.U1.pinMapping['14'],'ECHO');
 assert.equal(parts.U1.pinMapping['15'],'TRIG');
 assert.equal(validatePcbFabrication(p).status,'passed');
 assert.equal(exportPcbFabrication(p).status,'passed');
 const broken=structuredClone(p);
 const sda=broken.nets.find(n=>n.id==='OLED_SDA'),scl=broken.nets.find(n=>n.id==='OLED_SCL');
 sda.endpoints[1]='oled:SCL';
 scl.endpoints[1]='oled:SDA';
 broken.schematicWires = [];
 broken.breadboard = undefined;
 broken.pcbFabrication = undefined;
 assert.match(runProjectAnalysis(broken).message,/OLED SDA and SCL/);
});

test('Example 066 maps the servo port, reserve capacitance and ADC throughout the native views',async()=>{
 const p=JSON.parse(await readFile(new URL('../examples/066-arduino-servo-control.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(p,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(p,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(p,{getPartPins}).state,'complete');
 const parts=Object.fromEntries(p.pcbFabrication.physicalEvidence.map(item=>[item.reference,item]));
 assert.deepEqual(parts.J2.pinMapping,{'1':'GND','2':'VCC','3':'SERVO_PWM'});
 assert.deepEqual(parts.C4.pinMapping,{'1':'VCC','2':'GND'});
 assert.equal(parts.U1.pinMapping['15'],'SERVO_PWM');
 assert.equal(parts.U1.pinMapping['23'],'POT_OUT');
 assert.ok(p.pcbFabrication.routes.filter(route=>['VCC','GND'].includes(route.netId)).every(route=>route.widthMm===.75));
 const drc=validatePcbFabrication(p);
 assert.equal(drc.status,'passed',drc.errors.join('; '));
 assert.equal(exportPcbFabrication(p).status,'passed');
 assert.match(runProjectAnalysis(updateComponent(p,'servo-bulk',{value:'100 nF'})).message,/servo bulk capacitors/);
});

test('Example 067 maps the carrier, two supplies and bipolar motor connector throughout the native views',async()=>{
 const p=JSON.parse(await readFile(new URL('../examples/067-arduino-stepper-driver.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(p,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(p,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(p,{getPartPins}).state,'complete');
 const parts=Object.fromEntries(p.pcbFabrication.physicalEvidence.map(item=>[item.reference,item]));
 assert.deepEqual(parts.J1.pinMapping,{'1':'VCC','2':'GND'});
 assert.deepEqual(parts.J2.pinMapping,{'1':'VMOT','2':'GND'});
 assert.deepEqual(parts.J3.pinMapping,{'1':'MOTOR_A1','2':'MOTOR_A2','3':'MOTOR_B1','4':'MOTOR_B2'});
 assert.deepEqual(parts.U2.pinMapping,{'1':'DRIVER_ENABLE_N','2':'GND','3':'GND','4':'GND','5':'VCC','6':'VCC','7':'STEP','8':'DIR','9':'GND','10':'VCC','11':'MOTOR_A2','12':'MOTOR_A1','13':'MOTOR_B1','14':'MOTOR_B2','15':'GND','16':'VMOT'});
 assert.equal(validatePcbFabrication(p).status,'passed');
 assert.equal(exportPcbFabrication(p).status,'passed');
 assert.match(runProjectAnalysis(updateComponent(p,'motor-supply',{value:'5 V'})).message,/12 V VMOT/);
 assert.match(runProjectAnalysis(updateComponent(p,'motor-bulk',{value:'10 uF'})).message,/polarized motor bulk/);
});

test('Example 068 maps the USB-powered XIAO, temperature sensor and local UART port',async()=>{
 const p=JSON.parse(await readFile(new URL('../examples/068-esp32-telemetry-mock.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(p,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(p,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(p,{getPartPins}).state,'complete');
 const parts=Object.fromEntries(p.pcbFabrication.physicalEvidence.map(item=>[item.reference,item]));
 assert.deepEqual(parts.TS1.pinMapping,{'1':'VCC','2':'ADC','3':'GND'});
 assert.deepEqual(parts.J1.pinMapping,{'1':'GND','2':'TX'});
 assert.equal(parts.U1.pinMapping['2'],'ADC');
 assert.equal(parts.U1.pinMapping['7'],'TX');
 assert.equal(parts.U1.pinMapping['14'],'NC');
 assert.equal(validatePcbFabrication(p).status,'passed');
 assert.equal(exportPcbFabrication(p).status,'passed');
 const misconfigured=updateComponent(p,'sensor',{value:'Temperature 25 C; Scale 10 mV/C; Offset 0 mV'});
 assert.match(runProjectAnalysis(misconfigured).message,/500 mV offset/);
});

test('Example 069 maps the USB-powered Pico, input divider and I2C OLED in all three views',async()=>{
 const p=JSON.parse(await readFile(new URL('../examples/069-pico-adc-voltmeter.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(p,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(p,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(p,{getPartPins}).state,'complete');
 const parts=Object.fromEntries(p.pcbFabrication.physicalEvidence.map(item=>[item.reference,item]));
 assert.deepEqual(parts.J1.pinMapping,{'1':'VIN_HI','2':'GROUND'});
 assert.deepEqual(parts.J2.pinMapping,{'1':'GROUND','2':'VCC','3':'OLED_SDA','4':'OLED_SCL'});
 assert.equal(parts.U1.pinMapping['31'],'ADC_MID');
 assert.equal(parts.U1.pinMapping['33'],'GROUND');
 assert.equal(parts.U1.pinMapping['36'],'VCC');
 assert.equal(validatePcbFabrication(p).status,'passed');
 assert.equal(exportPcbFabrication(p).status,'passed');
 assert.match(runProjectAnalysis(updateComponent(p,'upper',{value:'20 kΩ'})).message,/10 k divider/);
});

test('Example 070 routes the documented Nucleo CN4 pins through the carrier',async()=>{
 const p=JSON.parse(await readFile(new URL('../examples/070-stm32-timer-pwm.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(p,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(p,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(p,{getPartPins}).state,'complete');
 assert.match(renderBreadboardAssemblySvg(p),/nucleo-g031k8-board/);
 const board=p.pcbFabrication.physicalEvidence.find(c=>c.reference==='U1');
 assert.equal(board.pinMapping['CN4-2'],'GND');
 assert.equal(board.pinMapping['CN4-12'],'PWM_LED');
 assert.equal(board.pinMapping['CN4-14'],'VCC');
 assert.equal(Object.values(board.pinMapping).filter(net=>net==='NC').length,27);
 assert.equal(validatePcbFabrication(p).status,'passed');
 assert.equal(exportPcbFabrication(p).status,'passed');
 assert.match(runProjectAnalysis(updateComponent(p,'supply',{value:'5 V'})).message,/3.3 V source/);
});

test('Example 071 maps each PIC sink, bargraph segment and resistor-network branch',async()=>{
 const p=JSON.parse(await readFile(new URL('../examples/071-pic-adc-bargraph.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(p,view).reconciliationItems,[]);
 assert.equal(validateBreadboardTopology(p,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(p,{getPartPins}).state,'complete');
 const parts=Object.fromEntries(p.pcbFabrication.physicalEvidence.map(item=>[item.reference,item]));
 const sinkPins=[21,22,23,24,25,26,11,12,13,14];
 for(let i=0;i<10;i++){
  assert.equal(parts.DS1.pinMapping[20-i],'BAR_'+i);
  assert.equal(parts.DS1.pinMapping[i+1],'ANODE_'+i);
  assert.equal(parts.U1.pinMapping[sinkPins[i]],'BAR_'+i);
 }
 assert.equal(parts.RN1.pinMapping['1'],'VDD');
 assert.equal(parts.RN2.pinMapping['1'],'VDD');
 assert.equal(validatePcbFabrication(p).status,'passed');
 assert.equal(exportPcbFabrication(p).status,'passed');
 assert.equal(runProjectAnalysis(p).result.illuminatedSegments,5);
 assert.equal(runProjectAnalysis(updateComponent(p,'limit-0',{value:'10 Ω per branch'})).state,'blocked');
});

test('Example 072 maps the TSOP38438 and the local display without a fictitious optical wire',async()=>{
 const p=JSON.parse(await readFile(new URL('../examples/072-avr-ir-receiver.adigun.json',import.meta.url),'utf8'));
 const getPartPins=id=>findLibraryPart(id)?.pins??[];
 assert.equal(validateBreadboardTopology(p,{getPartPins}).state,'complete');
 assert.equal(validateBreadboardAssembly(p,{getPartPins}).state,'complete');
 assert.equal(p.nets.some(net=>net.endpoints.some(ep=>ep.startsWith('frame:'))),false);
 assert.ok(p.pcbFabrication.nonPhysicalItems.some(item=>item.instanceId==='frame'));
 for(const view of ['breadboard','schematic','pcb'])assert.deepEqual(projectComponentsForView(p,view).reconciliationItems,[]);
 const parts=Object.fromEntries(p.pcbFabrication.physicalEvidence.map(item=>[item.reference,item]));
 assert.deepEqual(parts.IR1.pinMapping,{'1':'IR_RX','2':'GND','3':'VCC'});
 assert.deepEqual(parts.J2.pinMapping,{'1':'GND','2':'VCC','3':'DECODED_TEXT'});
 assert.equal(parts.U1.pinMapping['3'],'DECODED_TEXT');
 assert.equal(parts.U1.pinMapping['4'],'IR_RX');
 assert.equal(validatePcbFabrication(p).status,'passed');
 assert.equal(exportPcbFabrication(p).status,'passed');
});

test('example filters combine type, difficulty, category, search and actual PCB availability',()=>{
 const plc=filterExamples(index.entries,{type:'PLC',category:'Executable ladder logic',level:'Intermediate'});
 assert.equal(plc.total,2);assert.ok(plc.items.every(e=>e.pcbStatus==='logic'));
 const pcb=filterExamples(index.entries,{pcb:'stored'});assert.equal(pcb.total,105);assert.ok(pcb.items.every(e=>e.pcbPads>0));
 assert.equal(filterExamples(index.entries,{query:'ladder counter'}).total,1);
 assert.equal(filterExamples(index.entries,{query:'<script>nothing</script>'}).total,0);
});
test('bounded paging covers every result exactly once and handles empty or invalid page inputs',()=>{
 const visited=[];for(let page=0;page<6;page++)visited.push(...filterExamples(index.entries,{page}).items.map(e=>e.file));
 assert.deepEqual(visited,index.entries.map(e=>e.file));assert.equal(new Set(visited).size,216);
 assert.equal(filterExamples(index.entries,{page:999}).page,5);assert.equal(filterExamples(index.entries,{page:-2}).page,0);
 assert.ok(filterExamples(index.entries,{pageSize:1000000}).items.length<=100);assert.deepEqual(filterExamples(index.entries,{query:'missingxx'}).items,[]);
});
test('intentional fault studies open without admitting unrelated invalid projects',async()=>{
 for(const file of EXPECTED_DIAGNOSTICS){const raw=await readFile(new URL('../examples/'+file,import.meta.url),'utf8'),p=parseExampleProject(raw,'examples/'+file);assert.equal(canLoadExampleAnalysis('examples/'+file,runProjectAnalysis(p)),true);}
 const raw=await readFile(new URL('../examples/154-short-circuit-diagnosis.adigun.json',import.meta.url),'utf8');
 assert.throws(()=>parseExampleProject(raw,'examples/custom.adigun.json'));
 const invalid=JSON.parse(raw);invalid.schemaVersion=999;assert.throws(()=>parseExampleProject(JSON.stringify(invalid),'examples/154-short-circuit-diagnosis.adigun.json'));
 assert.equal(canLoadExampleAnalysis('examples/custom.adigun.json',{state:'blocked'}),false);
 assert.equal(canLoadExampleAnalysis('examples/154-short-circuit-diagnosis.adigun.json',{state:'unsupported'}),false);
});
test('six compatible LED and synchronization projects retain their analysis after PCB assignment',async()=>{
 for(const id of ['001-led-current-limiter','003-led-current-limiter-9v','007-led-current-limiter-12v','008-led-current-limiter-3v3','181-breadboard-schematic-sync','183-three-view-led-project']){
  const p=JSON.parse(await readFile(new URL('../examples/'+id+'.adigun.json',import.meta.url),'utf8')),before=structuredClone(p);delete before.pcbFabrication;
  assert.deepEqual(validatePcbFabrication(p).errors,[],id);assert.deepEqual(runProjectAnalysis(p).result,runProjectAnalysis(before).result,id);
  assert.equal(pcbCoverage(p).parts,3);assert.equal(pcbCoverage(p).pads,6);assert.match(renderPcbPreviewSvg(p),/data-pcb-footprint=/);
 }
});

test("Vishay 0603 resistor projects to schematic and routed PCB with a breadboard adapter diagnostic", async () => {
  const load = async path => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
  const project = await load("../examples/012-rc-low-pass.adigun.json");
  delete project.breadboard;
  const footprint = await load("../library/assets/footprints/vishay.crcw0603100rjnea/footprint.json");
  const instanceId = "resistor-1";
  const resistor = project.components.find(part => part.instanceId === instanceId);
  resistor.value = "100 Ω";
  const pcb = project.pcbFabrication;
  const assembly = pcb.parts.find(part => part.instanceId === instanceId);
  Object.assign(assembly, {
    footprint: footprint.package,
    technology: "smd",
    manufacturerPartNumber: "CRCW0603100RJNEA",
    sourceUrl: footprint.packageOutline.sourceUrl
  });
  pcb.physicalEvidence = pcb.physicalEvidence.filter(part => part.reference !== resistor.reference);
  for (const pad of pcb.pads.filter(pad => pad.instanceId === instanceId)) {
    const land = footprint.pads.find(land => land.number === pad.number);
    const route = pcb.routes.find(route => route.netId === pad.netId);
    const point = route.pointsMm.find(point => point[0] === pad.xMm && point[1] === pad.yMm);
    point[0] = 21 + land.xMm;
    Object.assign(pad, {
      technology: "smd", xMm: point[0],
      widthMm: footprint.padPattern.widthMm, heightMm: footprint.padPattern.heightMm
    });
    delete pad.diameterMm;
    delete pad.drillMm;
  }
  for (const view of ["schematic", "pcb"]) {
    assert.equal(projectComponentsForView(project, view).components.find(part => part.instanceId === instanceId), resistor);
  }
  const breadboard = projectComponentsForView(project, "breadboard");
  assert.ok(!breadboard.components.includes(resistor));
  assert.match(breadboard.reconciliationItems.find(issue => issue.instanceId === instanceId)?.reason ?? "",
    /0603 breakout with documented terminal-to-hole mapping/);
  const fabrication = exportPcbFabrication(project);
  assert.equal(fabrication.status, "passed", fabrication.drc.errors.join("\n"));
  assert.match(fabrication.files["board-F_Cu.gbr"], /R,0\.75X1\*/);
  assert.match(renderPcbPreviewSvg(project), /data-pcb-footprint="resistor-1"/);
  const analysis = runProjectAnalysis(project);
  assert.equal(analysis.state, "complete", analysis.message);
  assert.equal(analysis.scopeRecording.preferredNet, "FILTER_OUT");
});

for (const [orderCode, value, height, startX, aperture] of [
  ["XAL5030-102MEC", "1 µH", 3.1, 38.345, "R,1.18X4.7*"],
  ["XAL5050-103MEC", "10 µH", 5.1, 38.345, "R,1.18X4.7*"],
  ["XGL4030-102MEC", "1 µH", 3.1, 38.815, "R,0.98X3.4*"]
]) {
  test(`Coilcraft ${orderCode} maps its winding start to the rotated land and RL net`, async () => {
    const load = async path => JSON.parse(await readFile(new URL(path, import.meta.url), "utf8"));
    const project = await load("../examples/006-rl-step-response.adigun.json");
    const footprint = await load(`../library/assets/footprints/coilcraft.${orderCode.toLowerCase()}/footprint.json`);
    assert.equal(footprint.packageOutline.heightMaxMm, height);
    delete project.breadboard;
    const instanceId = "inductor-1";
    const inductor = project.components.find(part => part.instanceId === instanceId);
    inductor.value = value;
    const pcb = project.pcbFabrication;
    const assembly = pcb.parts.find(part => part.instanceId === instanceId);
    Object.assign(assembly, {
      footprint: footprint.package,
      technology: "smd",
      manufacturer: "Coilcraft",
      manufacturerPartNumber: orderCode,
      sourceUrl: footprint.packageOutline.sourceUrl,
      rotationDeg: 180
    });
    pcb.physicalEvidence = pcb.physicalEvidence?.filter(part => part.reference !== inductor.reference) ?? [];
    for (const pad of pcb.pads.filter(pad => pad.instanceId === instanceId)) {
      const land = footprint.pads.find(land => land.number === pad.number);
      const route = pcb.routes.find(route => route.netId === pad.netId);
      const point = route.pointsMm.find(point => point[0] === pad.xMm && point[1] === pad.yMm);
      point[0] = 40 - land.xMm;
      Object.assign(pad, { technology: "smd", xMm: point[0],
        widthMm: footprint.padPattern.widthMm, heightMm: footprint.padPattern.heightMm });
      delete pad.diameterMm;
      delete pad.drillMm;
    }
    const windingStart = pcb.pads.find(pad => pad.instanceId === instanceId && pad.number === "1");
    assert.equal(windingStart.netId, "RL_NODE");
    assert.equal(windingStart.xMm, startX);
    for (const view of ["schematic", "pcb"]) {
      assert.ok(projectComponentsForView(project, view).components.includes(inductor));
    }
    const breadboard = projectComponentsForView(project, "breadboard");
    assert.ok(!breadboard.components.includes(inductor));
    assert.match(breadboard.reconciliationItems.find(issue => issue.instanceId === instanceId)?.reason ?? "", /documented breakout/);
    const fabrication = exportPcbFabrication(project);
    assert.equal(fabrication.status, "passed", fabrication.drc.errors.join("\n"));
    assert.ok(fabrication.files["BOM.csv"].includes(orderCode));
    assert.ok(fabrication.files["board-F_Cu.gbr"].includes(aperture));
    assert.match(renderPcbPreviewSvg(project), /data-pcb-footprint="inductor-1"/);
    const analysis = runProjectAnalysis(project);
    assert.equal(analysis.state, "complete", analysis.message);
    assert.ok(analysis.scopeRecording?.samples.length);
  });
}
