import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {filterExamples,pcbCoverage,EXPECTED_DIAGNOSTICS} from '../js/example-bank.mjs';
import {runProjectAnalysis} from '../js/analysis-dispatch.mjs';
import {renderPcbPreviewSvg} from '../js/pcb-preview.mjs';
import {parseExampleProject,canLoadExampleAnalysis} from '../js/example-loading.mjs';
import {describeExample} from '../js/example-bank-ui.mjs';
import {validatePcbFabrication} from '../js/pcb-export.mjs';
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
 assert.equal(index.summary.withStoredPcb,29);assert.equal(index.summary.withoutStoredPcb,187);assert.deepEqual(index.summary.unexpectedFailures,[]);
});
test('PWM LED dimmer carries a source-backed physical PCB map without changing its ideal analysis',async()=>{
 const entry=index.entries.find(item=>item.file==='005-pwm-led-dimmer.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/005-pwm-led-dimmer.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,4);assert.equal(entry.pcbPads,10);
 assert.equal(validatePcbFabrication(project).status,'passed');
 assert.equal(runProjectAnalysis(project).result.kind,'pwm-led-average');
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="mosfet-1"/);
 assert.deepEqual(project.pcbFabrication.physicalEvidence.map(item=>item.reference),['J1','R1','D1','Q1']);
 assert.match(project.pcbFabrication.fabricationNotes.at(-1),/not a manufacturing DRC/);
});
test('5 V Parallel Resistor Load exports its exact external supply, resistor pads and net routes',async()=>{
 const entry=index.entries.find(item=>item.file==='004-parallel-resistor-load.adigun.json');
 const project=JSON.parse(await readFile(new URL('../examples/004-parallel-resistor-load.adigun.json',import.meta.url),'utf8'));
 assert.equal(entry.pcbStatus,'stored');assert.equal(entry.pcbParts,4);assert.equal(entry.pcbPads,8);
 assert.equal(validatePcbFabrication(project).status,'passed');
 assert.equal(runProjectAnalysis(project).result.kind,'resistive-network');
 assert.match(renderPcbPreviewSvg(project),/data-pcb-footprint="resistor-branch-1"/);
 assert.deepEqual(project.pcbFabrication.physicalEvidence.map(item=>item.reference),['J1','R1','R2','R3']);
});
test('example filters combine type, difficulty, category, search and actual PCB availability',()=>{
 const plc=filterExamples(index.entries,{type:'PLC',category:'Executable ladder logic',level:'Intermediate'});
 assert.equal(plc.total,2);assert.ok(plc.items.every(e=>e.pcbStatus==='logic'));
 const pcb=filterExamples(index.entries,{pcb:'stored'});assert.equal(pcb.total,29);assert.ok(pcb.items.every(e=>e.pcbPads>0));
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
