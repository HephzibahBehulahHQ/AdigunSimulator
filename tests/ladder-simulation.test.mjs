import test from 'node:test';
import assert from 'node:assert/strict';
import {createEmptyProject,addComponent,findLibraryPart,parseProject,serializeProject} from '../js/core.mjs';
import {LADDER_PARTS,LADDER_MODELS,ladderParameters} from '../js/ladder-components.mjs';
import {runLadderSimulation} from '../js/ladder-simulation.mjs';
import {runProjectAnalysis} from '../js/analysis-dispatch.mjs';
import {renderSchematicSymbol} from '../js/schematic-symbols.mjs';
import {schematicPinPoint} from '../js/schematic-pin-layout.mjs';
import {editComponentField} from '../js/component-edit.mjs';
import {createFeedbackTimeline} from '../js/simulation-feedback-timeline.mjs';
import {scopeTrace} from '../js/oscilloscope-data.mjs';
import {drawSearchGroups} from '../js/editor-menu-tools.mjs';
import {readFile} from 'node:fs/promises';
const component=(id,kind,value)=>({instanceId:id,reference:id,libraryId:'plc.'+kind,value:value??LADDER_MODELS['plc.'+kind].defaultValue,position:{schematic:[120,120],breadboard:[120,120],pcb:[120,120]}});
function fixture(kind,value,ports={}){
 const p=createEmptyProject(),m=LADDER_MODELS['plc.'+kind];p.components=[component('D',kind,value)];p.nets=[];p.ladderSimulation={scanMs:10,durationMs:100};
 m.inputs.filter(pin=>!(kind.startsWith('coil')&&pin==='R')).forEach((pin,i)=>{const id='I'+i,pulse=ports[pin]??'state 0; events -';p.components.push(component(id,'input','tag '+id+'; '+pulse));p.nets.push({id:pin,endpoints:[id+':Q','D:'+pin]});});
 if(kind.startsWith('coil')){p.components.push(component('N','rail-right'));p.nets.push({id:'RETURN',endpoints:['D:R','N:L']});}
 for(const pin of m.outputs)p.nets.push({id:pin,endpoints:['D:'+pin]});return p;
}
const calculate=p=>{const a=runLadderSimulation(p);assert.equal(a.state,'complete',a.message);return a.result.samples;};
test('all 25 ladder instructions have genuine native pins, editable validated fields and distinct symbols',()=>{
 assert.equal(LADDER_PARTS.length,25);
 for(const part of LADDER_PARTS){let p=addComponent(createEmptyProject(),part.id),c=p.components[0];assert.equal(findLibraryPart(part.id),part);assert.equal(part.views.pcb,false);assert.equal(part.views.breadboard,false);assert.match(renderSchematicSymbol(part,c),/data-symbol-kind="ladder"/);for(const pin of part.pins)assert.ok(schematicPinPoint(c,part.pins,pin));assert.deepEqual(parseProject(serializeProject(p)).components,p.components);ladderParameters(c);}
 const p=fixture('ton','tag T1; presetMs 30',{IN:'state 1; events -'});assert.throws(()=>editComponentField(p,'D','modelSegment1','-5'));
 const changed=editComponentField(p,'D','modelSegment1','70');assert.equal(calculate(changed)[6].nets.Q,0);assert.equal(calculate(changed)[7].nets.Q,1);
 assert.throws(()=>ladderParameters(component('X','input','constructor x; state 0; events -')));
 assert.equal(drawSearchGroups('ctud').flatMap(g=>g.parts).length,1);assert.equal(drawSearchGroups('nonexistent-part').length,0);
});
test('contacts and all coil variants obey Boolean state, retention and reset',()=>{
 for(const kind of ['contact-no','contact-nc']){const s=calculate(fixture(kind,'tag START; state 0; events 20:1',{L:'state 1; events -'}));assert.equal(s[1].nets.R,kind==='contact-nc'?1:0);assert.equal(s[2].nets.R,kind==='contact-no'?1:0);}
 for(const kind of ['coil','coil-negated','coil-set','coil-reset']){const s=calculate(fixture(kind,'tag Q1; initial '+(kind==='coil-reset'?1:0),{L:'state 0; events 20:1,40:0'}));assert.equal(s[2].bits.Q1,['coil','coil-set'].includes(kind)?1:0);assert.equal(s[5].bits.Q1,['coil-negated','coil-set'].includes(kind)?1:0);}
});
test('TON, TOF and TP track scan time, resets and non-retriggerable pulse duration',()=>{
 const ton=calculate(fixture('ton','tag T1; presetMs 30',{IN:'state 0; events 20:1,80:0'}));assert.equal(ton[4].nets.Q,0);assert.equal(ton[5].nets.Q,1);assert.equal(ton[8].blocks.D.elapsedMs,0);
 const tof=calculate(fixture('tof','tag T1; presetMs 30',{IN:'state 0; events 20:1,60:0'}));assert.equal(tof[0].nets.Q,0);assert.equal(tof[2].nets.Q,1);assert.equal(tof[8].nets.Q,1);assert.equal(tof[9].nets.Q,0);
 const tp=calculate(fixture('tp','tag T1; presetMs 40',{IN:'state 0; events 20:1,30:0,40:1,50:0'}));assert.equal(tp[2].nets.Q,1);assert.equal(tp[5].nets.Q,1);assert.equal(tp[6].nets.Q,0);assert.equal(tp[6].blocks.D.elapsedMs,40);
});
test('edge detectors, latches and six comparison functions calculate actual logic',()=>{
 for(const kind of ['r-trig','f-trig']){const s=calculate(fixture(kind,'tag EDGE',{CLK:'state 0; events 20:1,60:0'}));assert.deepEqual(s.map((x,i)=>x.nets.Q?i:null).filter(x=>x!==null),[kind==='r-trig'?2:6]);}
 for(const kind of ['sr','rs']){const s=calculate(fixture(kind,'tag LATCH',{SET:'state 0; events 10:1,40:0',RESET:'state 0; events 20:1,30:0'}));assert.equal(s[2].nets.Q,kind==='sr'?1:0);assert.equal(s[5].nets.Q,1);}
 for(const [op,expected] of Object.entries({eq:0,ne:1,gt:1,ge:1,lt:0,le:0})){const s=calculate(fixture('compare-'+op,'left 5; right 3',{EN:'state 1; events 70:0'}));assert.equal(s[0].nets.Q,expected);assert.equal(s[7].nets.Q,0);}
});
test('counters use edges, reset/load priority and simultaneous up/down cancellation',()=>{
 const ctu=calculate(fixture('ctu','tag C; preset 3',{CU:'state 0; events 10:1,20:0,30:1,40:0,50:1',RESET:'state 0; events 70:1'}));assert.equal(ctu[5].blocks.D.count,3);assert.equal(ctu[5].nets.Q,1);assert.equal(ctu[7].blocks.D.count,0);
 const ctd=calculate(fixture('ctd','tag C; preset 2',{CD:'state 0; events 20:1,30:0,40:1',LOAD:'state 1; events 10:0'}));assert.equal(ctd[0].blocks.D.count,2);assert.equal(ctd[4].blocks.D.count,0);assert.equal(ctd[4].nets.Q,1);
 const ctud=calculate(fixture('ctud','tag C; preset 2',{CU:'state 0; events 20:1,30:0,40:1',CD:'state 0; events 20:1',RESET:'state 0; events 70:1',LOAD:'state 1; events 10:0,70:1'}));assert.equal(ctud[2].blocks.D.count,2);assert.equal(ctud[4].blocks.D.count,3);assert.equal(ctud[7].blocks.D.count,0);assert.equal(ctud[7].nets.QD,1);
});
test('invalid/mixed circuits, driverless inputs, cycles, conflicting tags and excessive work are blocked',()=>{
 let p=fixture('ton');p.components.push({...component('X','coil'),libraryId:'passive.resistor',value:'1 kΩ'});assert.equal(runLadderSimulation(p).state,'blocked');
 p=fixture('ton');p.nets.find(n=>n.id==='IN').endpoints=['D:IN'];assert.match(runLadderSimulation(p).message,/driven/);
 p=fixture('ton');p.nets=[{id:'CYCLE',endpoints:['D:IN','D:Q']}];assert.match(runLadderSimulation(p).message,/cycles/);
 p=fixture('ton');p.ladderSimulation={scanMs:1,durationMs:60000};assert.equal(runLadderSimulation(p).state,'blocked');
 p=fixture('ton');p.components.push(component('D2','ton'));assert.match(runLadderSimulation(p).message,/writer/);
});
test('ladder playback and floating scope expose sampled logic, never invented volts or current',()=>{
 const p=fixture('ton','tag T; presetMs 30',{IN:'state 1; events -'}),a=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,a),live={status:'ready',kind:'transient',sampleIndex:4,data:timeline.frame(4)};
 assert.equal(live.data.units,'logic');assert.deepEqual(live.data.wires,{});const trace=scopeTrace(p,a,live,'Q');assert.equal(trace.units,'logic');assert.equal(trace.voltage,1);assert.deepEqual(trace.points.at(-1),[.04,1]);
});
test('connected seal-in example holds through START release and drops on STOP',async()=>{
 const p=parseProject(await readFile(new URL('../examples/supplemental-ladder-seal-in.adigun.json',import.meta.url),'utf8')),s=calculate(p);
 assert.equal(s[9].bits.MOTOR,0);assert.equal(s[10].bits.MOTOR,1);assert.equal(s[20].bits.MOTOR,1);assert.equal(s[69].bits.MOTOR,1);assert.equal(s[70].bits.MOTOR,0);
 // A downstream read-only contact cannot overwrite its coil's output image.
 p.components.push(component('READ','contact-nc','tag MOTOR; state 0; events -'));
 p.nets.find(n=>n.id==='RUN').endpoints.push('READ:L');
 assert.equal(calculate(p)[20].bits.MOTOR,1);
});
test('connected timer/counter example delays actual edges and resets the output',async()=>{
 const p=parseProject(await readFile(new URL('../examples/supplemental-ladder-timer-counter.adigun.json',import.meta.url),'utf8')),s=calculate(p);
 assert.equal(s[12].blocks.C1.count,0);assert.equal(s[13].blocks.C1.count,1);assert.equal(s[52].bits.DONE,0);assert.equal(s[53].bits.DONE,1);assert.equal(s[80].blocks.C1.count,0);assert.equal(s[80].bits.DONE,0);
 p.ladderSimulation.scanMs=0;assert.throws(()=>parseProject(serializeProject(p)));
});
test('set/reset simultaneous assertion resets and inconsistent initialization is rejected',()=>{
 const p=fixture('coil-set','tag Q1; initial 0',{L:'state 1; events -'});
 p.components.push(component('R','coil-reset','tag Q1; initial 0'));
 p.nets.find(n=>n.id==='L').endpoints.push('R:L');p.nets.find(n=>n.id==='RETURN').endpoints.push('R:R');
 assert.equal(calculate(p)[0].bits.Q1,0);
 p.components.at(-1).value='tag Q1; initial 1';assert.match(runLadderSimulation(p).message,/initial/);
});
