import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { parseProject,serializeProject,connectPins,disconnectPin,removeComponent,moveComponent } from "../js/core.mjs";
import { runProjectAnalysis } from "../js/analysis-dispatch.mjs";
import { storeSchematicWire,finishSchematicWire,resumeSchematicWire,joinDanglingWire,resolveSchematicWires,editWireRoute,splitSchematicWire,removeSchematicWire,nearestWireSegment } from "../js/schematic-wires.mjs";
import { createCrossingPainter,segmentIntersection } from "../js/wire-crossings.mjs";
const fixture=async()=>parseProject(await readFile(new URL('../examples/005-rc-step-response.adigun.json',import.meta.url),'utf8'));
const groups=p=>p.nets.map(n=>n.endpoints.slice().sort().join('|')).sort();
test('freeform geometry round-trips without changing circuit results, and endpoints follow moved parts',async()=>{
  const p=await fixture(),original=serializeProject(p),route=resolveSchematicWires(p)[0],points=[[80,80],[100,97],[230,72]];
  const next=editWireRoute(p,route,points),wire=next.schematicWires[0];
  assert.equal(serializeProject(p),original);assert.deepEqual(runProjectAnalysis(next).result,runProjectAnalysis(p).result);
  assert.deepEqual(parseProject(serializeProject(next)).schematicWires,next.schematicWires);
  const moved=moveComponent(next,wire.from.split(':')[0],'schematic',[150,100],{snap:false});
  const after=resolveSchematicWires(moved).find(r=>r.wireId===wire.id);
  assert.notDeepEqual(after.points[0],resolveSchematicWires(next)[0].points[0]);assert.deepEqual(after.points.slice(1,-1),points);
  assert.deepEqual(groups(next),groups(p));
});
test('paused wires persist without joining nets; resume and explicit endpoint join restore a split connection',async()=>{
  const p=await fixture(),route=resolveSchematicWires(p)[0],split=splitSchematicWire(p,route);
  assert.notDeepEqual(groups(split),groups(p));assert.equal(split.schematicWires.length,2);assert.ok(split.schematicWires.every(w=>w.to===null));
  const loaded=parseProject(serializeProject(split)),[a,b]=loaded.schematicWires,draft=resumeSchematicWire(a);
  assert.ok(Math.hypot(a.end[0]-b.end[0],a.end[1]-b.end[1])>15.9,'split endpoints need independent hit targets');
  assert.deepEqual(draft.waypoints.at(-1),a.end);
  const joined=joinDanglingWire(loaded,draft,b.id);
  assert.deepEqual(groups(joined),groups(p));assert.deepEqual(joined.nets.map(n=>n.id).sort(),p.nets.map(n=>n.id).sort());assert.equal(joined.schematicWires.length,1);assert.equal(joined.schematicWires[0].to,b.from);
  assert.deepEqual(runProjectAnalysis(joined).result,runProjectAnalysis(p).result);
  const paused=storeSchematicWire(p,{from:route.first,waypoints:[[20,40]],end:[21,60]});
  assert.deepEqual(groups(paused),groups(p));assert.deepEqual(runProjectAnalysis(paused).result,runProjectAnalysis(p).result);
  const removed=removeSchematicWire(paused,{wireId:paused.schematicWires[0].id});assert.equal(removed.schematicWires.length,0);assert.deepEqual(groups(removed),groups(p));
});
test('deleting components or electrical edges prunes only their routes, while net merging preserves other geometry',async()=>{
  const p=await fixture(),routes=resolveSchematicWires(p);let next=p;
  for(const r of routes)next=editWireRoute(next,r,[[35,45]]);
  const first=next.schematicWires[0],kept=next.schematicWires.filter(w=>w.from!==first.from&&w.to!==first.from);
  const disconnected=disconnectPin(next,first.from);assert.deepEqual(disconnected.schematicWires,kept);
  assert.doesNotThrow(()=>parseProject(serializeProject(disconnected)));
  const removed=removeComponent(next,first.from.split(':')[0]);assert.ok(removed.schematicWires.every(w=>!w.from.startsWith(first.from.split(':')[0]+':')&&!w.to?.startsWith(first.from.split(':')[0]+':')));
  const merged=connectPins(next,routes[0].first,routes[1].second);assert.deepEqual(merged.schematicWires,next.schematicWires);
});
test('native import rejects dangling, duplicate, unconnected, excessive and nonfinite route data',async()=>{
  const p=await fixture(),route=resolveSchematicWires(p)[0],next=editWireRoute(p,route,[[12,34]]);
  for(const mutate of [w=>w.waypoints=[[null,3]],w=>w.waypoints=Array(513).fill([1,2]),w=>w.from='missing:1',w=>w.to=null,w=>w.end=[1,2]]){
    const bad=structuredClone(next);mutate(bad.schematicWires[0]);assert.throws(()=>parseProject(serializeProject(bad)),/wire/i);
  }
  const duplicate=structuredClone(next);duplicate.schematicWires.push({...duplicate.schematicWires[0],id:'different'});assert.throws(()=>parseProject(serializeProject(duplicate)),/wire/i);
  assert.throws(()=>finishSchematicWire(p,{from:route.first,waypoints:[]},route.first));
  assert.equal(nearestWireSegment([[0,0],[20,0],[20,20]],[23,9]).index,1);
});
test('crossing bridges use actual diagonal/polyline intersections and never create junctions',()=>{
  assert.deepEqual(segmentIntersection([0,0],[20,20],[0,20],[20,0]).point,[10,10]);
  assert.equal(segmentIntersection([0,0],[20,0],[20,0],[20,20]),null);
  const painter=createCrossingPainter();painter.path([[0,10],[20,10]]);
  assert.match(painter.path([[10,0],[10,20]]),/ A4 4 /);
  const bent=createCrossingPainter();bent.path([[0,0],[0,20],[20,20]]);assert.doesNotMatch(bent.path([[10,5],[10,15]]),/ A/);
  const bounded=createCrossingPainter(0);bounded.path([[0,10],[20,10]]);assert.doesNotMatch(bounded.path([[10,0],[10,20]]),/ A/);assert.equal(bounded.limited,true);
});
