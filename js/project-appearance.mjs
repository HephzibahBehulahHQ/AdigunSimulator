import { editWireRoute, checkedWireProject } from './schematic-wires.mjs';

export const DEFAULT_PALETTE=Object.freeze({wire:'#b8dce8',component:'#d8e8f5',background:'#071d2c',grid:'#173c50'});
export const validColor=value=>typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
export const awgArea=awg=>Math.PI/4*(.127*92**((36-awg)/39))**2;
export function validateWireAppearance(value){
  if(value===undefined)return true;
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['color','sizeMm2','gaugeAwg'].includes(k)))return false;
  if(value.color!==undefined&&!validColor(value.color))return false;
  if(value.sizeMm2!==undefined&&(!Number.isFinite(value.sizeMm2)||value.sizeMm2<.001||value.sizeMm2>300))return false;
  if(value.gaugeAwg!==undefined&&(!Number.isInteger(value.gaugeAwg)||value.gaugeAwg<0||value.gaugeAwg>40||!Number.isFinite(value.sizeMm2)||Math.abs(value.sizeMm2-awgArea(value.gaugeAwg))>1e-6))return false;
  return true;
}
export function validateProjectPalette(project){
  const p=project.palette;if(p===undefined)return [];
  const fail=()=>[{rule:'PROJECT_PALETTE',message:'Use a palette name up to 60 characters and four six-digit hex colors.'}];
  if(!p||typeof p.name!=='string'||!p.name.trim()||p.name.length>60||!p.colors||Object.keys(p.colors).length!==4||Object.keys(DEFAULT_PALETTE).some(k=>!validColor(p.colors[k])))return fail();
  return [];
}
export function editProjectPalette(project,palette){
  const next={...project,palette:structuredClone(palette),metadata:{...project.metadata,updatedAt:new Date().toISOString()}};
  const errors=validateProjectPalette(next);if(errors.length)throw new Error(errors[0].message);return next;
}
export function editWireAppearance(project,route,appearance){
  if(!route?.points)throw new Error('Select a schematic wire first.');
  if(!validateWireAppearance(appearance))throw new Error('Invalid wire color, area or AWG value.');
  const next=editWireRoute(project,route,route.points.slice(1,-1));
  const wire=next.schematicWires.find(w=>w.id===route.wireId||w.from===route.first&&w.to===route.second||w.from===route.second&&w.to===route.first);
  return checkedWireProject({...next,schematicWires:next.schematicWires.map(w=>w===wire?{...w,appearance:{...appearance}}:w)});
}
export function wireAppearance(project,route){
  return project.schematicWires?.find(w=>route.wireId?w.id===route.wireId:(w.from===route.first&&w.to===route.second||w.from===route.second&&w.to===route.first))?.appearance??{};
}
export function wirePaint(project,route){
  const style=wireAppearance(project,route);
  return {color:style.color??project.palette?.colors.wire??null,width:style.sizeMm2===undefined?null:Math.min(5,1.5+Math.log10(1+style.sizeMm2)*1.5)};
}
