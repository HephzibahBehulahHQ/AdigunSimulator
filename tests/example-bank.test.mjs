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
import {validateProject} from '../js/core.mjs';
import {validatePcbFabrication,exportPcbFabrication} from '../js/pcb-export.mjs';
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
 assert.equal(index.summary.withStoredPcb,33);assert.equal(index.summary.withoutStoredPcb,183);assert.deepEqual(index.summary.unexpectedFailures,[]);
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

test('example filters combine type, difficulty, category, search and actual PCB availability',()=>{
 const plc=filterExamples(index.entries,{type:'PLC',category:'Executable ladder logic',level:'Intermediate'});
 assert.equal(plc.total,2);assert.ok(plc.items.every(e=>e.pcbStatus==='logic'));
 const pcb=filterExamples(index.entries,{pcb:'stored'});assert.equal(pcb.total,33);assert.ok(pcb.items.every(e=>e.pcbPads>0));
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
