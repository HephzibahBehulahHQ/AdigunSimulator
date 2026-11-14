import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import {parseProject,serializeProject} from '../js/core.mjs';
import {runProjectAnalysis} from '../js/analysis-dispatch.mjs';
import {createFeedbackTimeline} from '../js/simulation-feedback-timeline.mjs';
import {resolveSchematicWires,editWireRoute,splitSchematicWire,resumeSchematicWire,joinDanglingWire} from '../js/schematic-wires.mjs';
import {DEFAULT_PALETTE,awgArea,editProjectPalette,editWireAppearance,wireAppearance,wirePaint,validateWireAppearance} from '../js/project-appearance.mjs';
import {scopeChannels,scopeTrace,scopePlot,fitScopeWindow} from '../js/oscilloscope-data.mjs';
import {designText} from '../js/design-tools-ui.mjs';
import {createScopeLauncher,hasCurrentScopeAnalysis,recordScopeAnalysis} from '../js/scope-launcher.mjs';
const fixture=async()=>parseProject(await readFile(new URL('./fixtures/junction-divider.adigun.json',import.meta.url),'utf8'));

test('wire appearance preserves identity, solver results, route edits, split/rejoin and native round trips',async()=>{
  const p=await fixture(),before=serializeProject(p),route=resolveSchematicWires(p).find(r=>r.wireId==='W1'),style={color:'#1234ff',gaugeAwg:18,sizeMm2:awgArea(18)};
  let next=editWireAppearance(p,route,style);assert.deepEqual(wireAppearance(next,route),style);assert.equal(serializeProject(p),before);
  assert.deepEqual(runProjectAnalysis(next).result,runProjectAnalysis(p).result);
  next=editWireRoute(next,route,[[140,60],[350,60]]);assert.deepEqual(wireAppearance(next,route),style);
  const split=splitSchematicWire(next,resolveSchematicWires(next).find(r=>r.wireId==='W1')),halves=split.schematicWires.filter(w=>w.to===null);
  assert.equal(halves.length,2);for(const w of halves)assert.deepEqual(w.appearance,style);
  const joined=joinDanglingWire(split,resumeSchematicWire(halves[0]),halves[1].id);
  assert.deepEqual(joined.schematicWires.find(w=>w.id===halves[0].id).appearance,style);
  assert.deepEqual(parseProject(serializeProject(joined)).schematicWires,joined.schematicWires);
  assert.equal(wirePaint(next,route).color,'#1234ff');assert.ok(wirePaint(next,route).width>1.5);
});
test('unmaterialized wires get stored styling; AWG annotations reject invalid or contradictory values',async()=>{
  const p=await fixture();delete p.schematicWires;const route=resolveSchematicWires(p)[0],next=editWireAppearance(p,route,{sizeMm2:2.5,color:'#ff1122'});
  assert.equal(next.schematicWires.length,1);assert.equal(wireAppearance(next,route).sizeMm2,2.5);
  assert.ok(Math.abs(awgArea(18)-.823047)<.000002);assert.ok(Math.abs(awgArea(36)-.0126677)<1e-6);
  for(const value of [{color:'red'},{color:'url(secret)'},{sizeMm2:-1},{gaugeAwg:18,sizeMm2:2.5},{gaugeAwg:41,sizeMm2:1},{gaugeAwg:18.5,sizeMm2:1}]){
    assert.equal(validateWireAppearance(value),false);const bad=structuredClone(next);bad.schematicWires[0].appearance=value;assert.throws(()=>parseProject(JSON.stringify(bad)));
  }
});
test('palette is project-owned, escaped by validation, reversible and does not overwrite explicit wire colors',async()=>{
  const p=await fixture(),palette={name:'Workshop',colors:{...DEFAULT_PALETTE,wire:'#0000ff',background:'#112233'}};
  const next=editProjectPalette(p,palette);assert.equal(p.palette,undefined);palette.colors.wire='#ffffff';assert.equal(next.palette.colors.wire,'#0000ff');
  const route=resolveSchematicWires(next)[0];assert.equal(wirePaint(next,route).color,'#0000ff');
  const manual=editWireAppearance(next,route,{color:'#00ff00'});assert.equal(wirePaint(manual,route).color,'#00ff00');assert.equal(wirePaint(editWireAppearance(manual,resolveSchematicWires(manual).find(r=>r.first===route.first&&r.second===route.second),{}),route).color,'#0000ff');
  assert.deepEqual(parseProject(serializeProject(next)).palette,next.palette);assert.deepEqual(runProjectAnalysis(next).result,runProjectAnalysis(p).result);
  const bad=structuredClone(next);bad.palette.colors.background='url(https://invalid)';assert.throws(()=>parseProject(JSON.stringify(bad)));
});
test('scope uses actual RC solver samples and respects the live playback cursor',async()=>{
  const p=parseProject(await readFile(new URL('../examples/005-rc-step-response.adigun.json',import.meta.url),'utf8'));
  p.components=p.components.map(c=>({...c,value:c.libraryId==='passive.resistor'?'1 kΩ':c.libraryId==='passive.capacitor'?'1 µF':c.value}));p.linearRlcTransient={stopSeconds:.005,timeStepSeconds:.00001};
  const analysis=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,analysis),live={status:'ready',kind:'transient',data:timeline.frame(49),sampleIndex:49};
  const channels=scopeChannels(p,analysis,live);assert.ok(channels.length>0);const trace=scopeTrace(p,analysis,live,channels[0]);
  assert.equal(trace.points.length,50);assert.deepEqual(trace.points[49],[analysis.result.samples[49].timeSeconds,analysis.result.samples[49].nodeVoltages[0]]);
  const plot=scopePlot(trace);assert.match(plot.path,/^M/);assert.ok(!/NaN|Infinity/.test(plot.path));assert.ok(plot.cursorX<480);assert.equal(scopeTrace(p,analysis,{...live,status:'updating'},channels[0]),null);
  assert.equal(scopeTrace(p,analysis,live,'invented-net'),null);
});
test('DC is honestly flat and stopped/unsupported models do not produce fake waveforms',async()=>{
  const p=await fixture(),analysis=runProjectAnalysis(p),timeline=createFeedbackTimeline(p,analysis),live={status:'ready',kind:'dc',data:timeline.frame(0),sampleIndex:0};
  const trace=scopeTrace(p,analysis,live,'VCC');assert.equal(trace.kind,'dc');assert.equal(trace.voltage,9);assert.equal(trace.points[0][1],trace.points[1][1]);assert.equal(scopePlot(trace,1).clipped,true);
  assert.deepEqual(scopeChannels(p,analysis,{status:'idle',data:null}),[]);assert.equal(scopeTrace(p,analysis,{status:'unsupported'},'VCC'),null);
});
test('scope movement/resizing stays inside canvas limits on desktop and narrow viewports',()=>{
  for(const bounds of [{x:300,y:190,width:850,height:460},{x:12,y:250,width:320,height:260},{x:2,y:90,width:180,height:110}]){
    for(const attempted of [{x:-200,y:-500,width:9000,height:8000},{x:2000,y:2000,width:1,height:1},{x:300,y:10,width:260,height:38,minimized:true}]){
      const b=fitScopeWindow(attempted,bounds);assert.ok(b.x>=bounds.x&&b.y>=bounds.y);assert.ok(b.x+b.width<=bounds.x+bounds.width);assert.ok(b.y+b.height<=bounds.y+bounds.height);
    }
  }
  for(const locale of ['en','de','yo','pcm'])for(let i=0;i<35;i++)assert.ok(designText(locale,i));
});

test('floating scope launcher appears only for the current project and opens the existing scope',()=>{
 let opened=0,removed=0;
 const document={createElement(tag){return {tag,hidden:false,attributes:{},handlers:{},setAttribute(key,value){this.attributes[key]=value;},addEventListener(name,fn){this.handlers[name]=fn;},remove(){removed++;}};}};
 const canvas={children:[],append(node){this.children.push(node);}},launcher=createScopeLauncher({document,canvas,onOpen:()=>opened++}),button=canvas.children[0];
 const state={project:{id:'p1'},lastAnalysis:null,lastAnalysisProjectKey:null};
 assert.equal(button.hidden,true);assert.equal(hasCurrentScopeAnalysis(state),false);
 recordScopeAnalysis(state,{state:'complete'},()=>launcher.update(state,'Open oscilloscope'));
 assert.equal(button.hidden,false);assert.equal(button.attributes['aria-label'],'Open oscilloscope');
 button.handlers.click({stopPropagation(){}});assert.equal(opened,1);
 recordScopeAnalysis(state,{state:'blocked',message:'Connect the supply return to ground.'},()=>launcher.update(state,'Open oscilloscope'));
 assert.equal(button.hidden,true);assert.equal(hasCurrentScopeAnalysis(state),false);
 recordScopeAnalysis(state,{state:'complete'},()=>launcher.update(state,'Open oscilloscope'));
 assert.equal(button.hidden,false);
 state.project={id:'p2'};launcher.update(state,'Open oscilloscope');assert.equal(button.hidden,true);
 launcher.remove();assert.equal(removed,1);
});

test('actual scope pointer handlers capture drag, reject other pointers, cancel and resize safely',async()=>{
  const source=await readFile(new URL('../js/design-tools-ui.mjs',import.meta.url),'utf8');
  const handlers={},captures=[],bounds={x:100,y:180,width:500,height:300};
  const context=vm.createContext({scope:{addEventListener:(name,fn)=>{handlers[name]=fn;},setPointerCapture:id=>captures.push(id)},fitScopeWindow,bounds});
  vm.runInContext('let box={x:110,y:190,width:260,height:180},drag=null; const position=()=>{box=fitScopeWindow(box,bounds);};'+source.slice(source.indexOf(' const down='),source.indexOf(" scope.addEventListener('keydown'")),context);
  const snapshot=()=>JSON.parse(vm.runInContext('JSON.stringify(box)',context));
  const event=(type,x,y,id=1,mode='move')=>({type,clientX:x,clientY:y,pointerId:id,button:0,preventDefault(){},target:{closest:s=>s==='.scope-'+mode}});
  const initial=snapshot();handlers.pointerdown(event('pointerdown',120,200));assert.deepEqual(captures,[1]);
  handlers.pointermove(event('pointermove',500,500,2));assert.deepEqual(snapshot(),initial);
  handlers.pointermove(event('pointermove',-900,-900));assert.equal(snapshot().y,180);assert.equal(snapshot().x,100);
  handlers.pointercancel(event('pointercancel',0,0));assert.deepEqual(snapshot(),initial);
  handlers.pointerdown(event('pointerdown',0,0,3,'resize'));handlers.pointermove(event('pointermove',900,900,3));
  assert.equal(snapshot().width,500);assert.equal(snapshot().height,300);handlers.pointerup(event('pointerup',900,900,3));
  const finished=snapshot();handlers.pointermove(event('pointermove',0,0,3));assert.deepEqual(snapshot(),finished);
});

