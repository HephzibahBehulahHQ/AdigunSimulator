import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {parseProject,serializeProject,removeComponent,disconnectPin,moveComponent} from '../js/core.mjs';
import {resolveSchematicWires,editWireRoute,moveSchematicJunction,splitSchematicWire,storeSchematicWire} from '../js/schematic-wires.mjs';
import {findJunctionCandidates,addSchematicJunction,removeSchematicJunction,finishWireAtJunction} from '../js/schematic-junctions.mjs';
import {junctionRouteSegments,junctionNode,junctionElectricalEdges} from '../js/schematic-junction-graph.mjs';
import {buildDcWireFeedback,wireEdgeKey} from '../js/dc-wire-feedback.mjs';
import {runProjectAnalysis} from '../js/analysis-dispatch.mjs';
import {createCrossingPainter} from '../js/wire-crossings.mjs';
const fixture=async()=>parseProject(await readFile(new URL('./fixtures/junction-divider.adigun.json',import.meta.url),'utf8'));
const groups=p=>p.nets.map(n=>n.endpoints.slice().sort().join('|')).sort();
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-9,`${a} != ${b}`);
function join(p){const routes=resolveSchematicWires(p);return addSchematicJunction(p,routes.find(r=>r.wireId==='W1'),routes.find(r=>r.wireId==='W2'),[200,80]);}

test('an explicit crossing junction changes solved connectivity; geometry alone never joins',async()=>{
  const p=await fixture(),before=serializeProject(p),original=runProjectAnalysis(p);assert.equal(original.state,'complete');near(original.result.nodeVoltages.VOUT,9*1200/2200);
  const route=resolveSchematicWires(p).find(r=>r.wireId==='W1');assert.ok(findJunctionCandidates(p,route).candidates.some(c=>c.point[0]===200&&c.point[1]===80));
  const connected=join(p),analysis=runProjectAnalysis(connected);assert.equal(analysis.state,'complete');near(analysis.result.resistors.find(r=>r.reference==='R1').currentA,0);near(analysis.result.resistors.find(r=>r.reference==='R2').currentA,.0045);
  assert.equal(serializeProject(p),before);assert.deepEqual(parseProject(serializeProject(connected)).schematicJunctions,connected.schematicJunctions);
  assert.equal(connected.components.length,p.components.length);assert.ok(connected.nets.every(n=>n.endpoints.every(e=>!e.startsWith('@'))));
  const removed=removeSchematicJunction(connected,'J1');assert.deepEqual(groups(removed),groups(p));near(runProjectAnalysis(removed).result.resistors.find(r=>r.reference==='R1').currentA,9/2200);
});

test('four junction branches carry solved KCL currents, not the hidden projection edge',async()=>{
  const p=join(await fixture()),analysis=runProjectAnalysis(p),feedback=buildDcWireFeedback(p,analysis),net=p.nets.find(n=>n.endpoints.includes('source-1:+')),j=junctionNode('J1');
  const edges=junctionElectricalEdges(p,net);assert.equal(edges.length,5);assert.ok(Object.values(feedback.wires).every(w=>Number.isFinite(w.currentA)));
  near(feedback.wires[wireEdgeKey(net.id,'source-1:+',j)].currentA,.0075);
  near(feedback.wires[wireEdgeKey(net.id,j,'resistor-top-1:1')].currentA,0);
  near(feedback.wires[wireEdgeKey(net.id,'resistor-top-1:2',j)].currentA,-.003);
  near(feedback.wires[wireEdgeKey(net.id,j,'resistor-bottom-1:1')].currentA,.0045);
  const painter=createCrossingPainter();for(const r of resolveSchematicWires(p).filter(r=>r.netId===net.id))for(const s of junctionRouteSegments(p,r)){const d=painter.path(s.points);if(s.measurementSecond===j)assert.match(d,/ L200 80$/);if(s.measurementFirst===j)assert.match(d,/^M200 80/);}
  assert.equal(resolveSchematicWires(p).length,resolveSchematicWires(await fixture()).length);
});

test('moving a junction or its waypoint moves every attached branch without changing nets',async()=>{
  const p=join(await fixture()),moved=moveSchematicJunction(p,'J1',[230,100]);assert.deepEqual(groups(moved),groups(p));
  assert.ok(moved.schematicWires.filter(w=>['W1','W2'].includes(w.id)).every(w=>w.waypoints.some(p=>p[0]===230&&p[1]===100)));
  const r=resolveSchematicWires(moved).find(r=>r.wireId==='W1'),points=r.points.slice(1,-1).map(p=>[...p]);points.find(p=>p[0]===230)[0]=240;
  const edited=editWireRoute(moved,r,points);assert.deepEqual(edited.schematicJunctions[0].point,[240,100]);assert.doesNotThrow(()=>parseProject(serializeProject(edited)));
  const shifted=moveComponent(edited,'source-1','schematic',[80,150],{snap:false});assert.deepEqual(shifted.schematicJunctions,edited.schematicJunctions);
  assert.throws(()=>editWireRoute(moved,r,points.filter(p=>p[0]!==240)),/junction/i);
});

test('explicit branches can terminate at a junction; splitting preserves the appropriate connected half',async()=>{
  let p=join(await fixture());p=finishWireAtJunction(p,{from:'resistor-bottom-1:2',waypoints:[[400,80]]},'J1');
  assert.equal(p.schematicJunctions[0].wires.length,3);assert.ok(runProjectAnalysis(p).state!=='complete','joining supply to ground is rejected by analysis');
  const base=join(await fixture()),r=resolveSchematicWires(base).find(r=>r.wireId==='W1'),split=splitSchematicWire(base,r);
  assert.equal(split.schematicJunctions.length,1);assert.ok(split.schematicWires.filter(w=>w.to===null).length===2);assert.doesNotThrow(()=>parseProject(serializeProject(split)));
  const point=split.schematicJunctions[0].point;assert.ok(split.schematicJunctions[0].wires.every(id=>{const w=split.schematicWires.find(w=>w.id===id);return w.waypoints.some(p=>p[0]===point[0]&&p[1]===point[1]);}));
});

test('deleting a pin or component removes orphan junction bridges and retains independent branches',async()=>{
  for(const operation of [p=>removeComponent(p,'source-1'),p=>disconnectPin(p,'source-1:+')]){
    const next=operation(join(await fixture()));assert.equal(next.schematicJunctions.length,0);assert.doesNotThrow(()=>parseProject(serializeProject(next)));assert.ok(next.schematicWires.some(w=>w.id==='W2'));
  }
});

test('multiple explicit junctions retain connectivity after one is removed and expose ideal loop ambiguity',async()=>{
  const original=await fixture(),first=join(original),a=resolveSchematicWires(first).find(r=>r.wireId==='W1');
  const choice=findJunctionCandidates(first,a).candidates.find(c=>c.point[0]!==200&&c.other.wireId==='W2');assert.ok(choice);
  const second=addSchematicJunction(first,a,choice.other,choice.point);assert.equal(second.schematicJunctions.length,2);
  assert.ok(Object.values(buildDcWireFeedback(second,runProjectAnalysis(second)).wires).some(w=>w.currentA===null&&w.reason.includes('indeterminate')));
  const remaining=removeSchematicJunction(second,'J1');assert.equal(remaining.schematicJunctions.length,1);assert.deepEqual(groups(remaining),groups(first));
  assert.ok(Object.values(buildDcWireFeedback(remaining,runProjectAnalysis(remaining)).wires).every(w=>Number.isFinite(w.currentA)));
  const removed=removeSchematicJunction(remaining,remaining.schematicJunctions[0].id);assert.deepEqual(groups(removed),groups(original));
  const routes=resolveSchematicWires(removed),painter=createCrossingPainter();painter.path(routes.find(r=>r.wireId==='W1').points);assert.match(painter.path(routes.find(r=>r.wireId==='W2').points),/ A/);
});

test('invalid junction imports reject missing paths, false anchors, bridge ownership and duplicate nodes',async()=>{
  const good=join(await fixture());
  for(const mutate of [j=>j.wires=['missing','W2'],j=>j.point=[4,4],j=>j.point=[null,0],j=>j.bridges=[['source-1:+','resistor-top-1:1']],j=>j.wires=['W1','W1']]){const bad=structuredClone(good);mutate(bad.schematicJunctions[0]);assert.throws(()=>parseProject(serializeProject(bad)),/junction/i);}
  const bad=structuredClone(good);bad.schematicJunctions.push({...bad.schematicJunctions[0],id:'J2'});assert.throws(()=>parseProject(serializeProject(bad)),/junction/i);
  assert.equal(findJunctionCandidates(good,resolveSchematicWires(good)[0],0).limited,true);
});
