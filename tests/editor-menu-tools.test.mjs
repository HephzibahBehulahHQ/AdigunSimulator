import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { createEmptyProject, addComponent, findLibraryPart, parseProject, serializeProject, updateComponent } from '../js/core.mjs';
import { drawGroups, drawMenuMarkup, attachDrawMenu, transformSchematicComponent, printProjectView, editorMenuText } from '../js/editor-menu-tools.mjs';
import { schematicPinPoint } from '../js/schematic-pin-layout.mjs';
import { resolveSchematicWires } from '../js/schematic-wires.mjs';
import { SCHEMATIC_PRIMITIVES } from '../js/schematic-primitives.mjs';
import { editComponentField } from '../js/component-edit.mjs';

test('Draw offers actual native symbols, grouped with accessible choices in four languages',()=>{
  const groups=drawGroups(),parts=groups.flatMap(g=>g.parts);
  assert.equal(groups.length,7);assert.equal(new Set(parts.map(p=>p.id)).size,parts.length);
  assert.ok(parts.some(p=>p.id==='passive.resistor'));assert.ok(parts.some(p=>p.id==='active.logic-and-ideal'));
  for(const p of parts)assert.ok(SCHEMATIC_PRIMITIVES[p.id]||p.id==='active.stm32-timer-ideal');
  for(const locale of ['en','de','yo','pcm']){
    const html=drawMenuMarkup(locale);assert.equal((html.match(/data-draw-part=/g)??[]).length,parts.length);
    for(const key of ['print','rotateLeft','rotateRight','mirrorX','mirrorY','delete','drawHint'])assert.notEqual(editorMenuText(locale,key),key);
  }
});
test('Draw click/hover opens category, choosing a part arms drawing once and closes the menu',()=>{
  const handlers=new Map(),groups=[{open:true},{open:false}];let chosen;
  const menu={open:true,querySelectorAll:()=>groups,addEventListener:(n,f)=>handlers.set(n,f),removeEventListener:n=>handlers.delete(n)};
  const dispose=attachDrawMenu(menu,id=>chosen=id);
  const target={closest:s=>s==='.draw-category'?groups[1]:null};
  handlers.get('pointerover')({target,pointerType:'mouse'});assert.equal(groups[1].open,true);assert.equal(groups[0].open,false);
  let prevented=false;handlers.get('click')({target:{closest:s=>s.includes('summary')?{parentElement:groups[0]}:null},preventDefault:()=>prevented=true});
  assert.equal(prevented,true);assert.equal(groups[0].open,true);assert.equal(menu.open,true);assert.equal(chosen,undefined);
  handlers.get('click')({target:{closest:s=>s==='[data-draw-part]'?{dataset:{drawPart:'passive.resistor'}}:null}});
  assert.equal(chosen,'passive.resistor');assert.equal(menu.open,false);dispose();assert.equal(handlers.size,0);
});
test('rotation and canvas-axis mirrors preserve electrical pins, nets and editable native geometry',async()=>{
  const source=JSON.parse(await readFile(new URL('../tests/fixtures/junction-divider.adigun.json',import.meta.url)));
  const id=source.components.find(c=>c.reference==='R2').instanceId;
  let project=updateComponent(source,id,{position:{...source.components.find(c=>c.instanceId===id).position,schematic:[375,180]}});
  const original=serializeProject(project),component=project.components.find(c=>c.instanceId===id),pins=findLibraryPart(component.libraryId).pins;
  const point=schematicPinPoint(component,pins,pins[0]),centerX=component.position.schematic[0]+28;
  project=transformSchematicComponent(project,id,'mirrorX');
  const mirrored=project.components.find(c=>c.instanceId===id),mp=schematicPinPoint(mirrored,pins,pins[0]);
  assert.equal(mp.x,2*centerX-point.x);assert.equal(mp.y,point.y);assert.equal(mp.side,'right');assert.deepEqual(project.nets,source.nets);
  assert.ok(resolveSchematicWires(project).some(route=>route.points.some(p=>p[0]===mp.x&&p[1]===mp.y)));
  project=transformSchematicComponent(project,id,'rotateRight');
  project=editComponentField(project,id,'width','80');assert.equal(project.components.find(c=>c.instanceId===id).geometry.schematic.mirrorX,true);
  const roundTrip=parseProject(serializeProject(project));assert.deepEqual(roundTrip.components,project.components);
  project=transformSchematicComponent(project,id,'resetOrientation');assert.equal(project.components.find(c=>c.instanceId===id).geometry.schematic.mirrorX,undefined);
  assert.equal(serializeProject(source)===original,false);assert.equal(component.geometry?.schematic?.mirrorX,undefined);
});
test('four turns and double reflection restore coordinates; invalid geometry or collisions cannot corrupt the project',()=>{
  let project=addComponent(createEmptyProject(),'active.npn-ebers-moll-generic'),id=project.components[0].instanceId;
  project=updateComponent(project,id,{position:{schematic:[280,130]}});
  const pins=findLibraryPart(project.components[0].libraryId).pins,coordinates=p=>pins.map(pin=>schematicPinPoint(p.components[0],pins,pin));
  const before=coordinates(project);
  for(let i=0;i<4;i++)project=transformSchematicComponent(project,id,'rotateRight');assert.deepEqual(coordinates(project),before);
  for(const action of ['mirrorX','mirrorY']){project=transformSchematicComponent(project,id,action);project=transformSchematicComponent(project,id,action);assert.deepEqual(coordinates(project),before);}
  const malformed=structuredClone(project);malformed.components[0].geometry.schematic.mirrorX='true';assert.throws(()=>parseProject(JSON.stringify(malformed)),/geometry/i);
  const edge=updateComponent(project,id,{position:{schematic:[0,0]}}),snapshot=serializeProject(edge);assert.throws(()=>transformSchematicComponent(edge,id,'rotateLeft'),/SPACE/);assert.equal(serializeProject(edge),snapshot);
});
test('print uses a clean clone of the active native view and afterprint cleans up without saving',()=>{
  const removed=[],nodes=[],events=new Map();let printed=0;
  const node=()=>({style:{},children:[],append(...xs){this.children.push(...xs);},remove(){removed.push(this);},querySelectorAll:()=>[{remove(){removed.push('ghost');}}]});
  const scene=node();scene.cloneNode=deep=>{assert.equal(deep,true);const n=node();nodes.push(n);return n;};
  const document={querySelector:s=>s.includes('canvas-scene')?scene:null,createElement:()=>node(),body:node()};
  const window={addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n),print:()=>printed++};
  const project=createEmptyProject(),before=serializeProject(project);
  printProjectView({document,window,project,view:'schematic',viewLabel:'Schematic View'});
  assert.equal(printed,1);assert.equal(nodes[0].style.transform,'none');assert.equal(scene.style.transform,undefined);assert.equal(serializeProject(project),before);
  const sheet=document.body.children[0];assert.equal(sheet.id,'project-print');assert.ok(sheet.children[1].textContent.includes('AdigunSimulator'));events.get('afterprint')();assert.ok(removed.includes(sheet));
});
test('actual Edit action captures history and marks dirty through existing component commit',async()=>{
  const source=await readFile(new URL('../app.js',import.meta.url),'utf8');
  const start=source.indexOf('function handleAction(action)'),end=source.indexOf('  if (action === "pcb-rotate-left")',start);
  const state={project:addComponent(createEmptyProject(),'passive.resistor'),activeView:'schematic'},previous=state.project;
  let captured;
  const action=runInNewContext(source.slice(start,end)+'};handleAction',{state,selectedComponent:()=>state.project.components[0],transformSchematicComponent,commitComponentEdit:p=>{captured=state.project;state.project=p;state.dirty=true;},showDialog:()=>assert.fail('Unexpected dialog'),t:k=>k,editorMenuText});
  action('transform-rotateRight');assert.equal(captured,previous);assert.equal(state.dirty,true);assert.equal(state.project.components[0].geometry.schematic.rotation,90);
});
