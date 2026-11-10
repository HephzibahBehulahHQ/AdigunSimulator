import { STARTER_LIBRARY, updateComponent } from './core.mjs';
import { SCHEMATIC_PRIMITIVES } from './schematic-primitives.mjs';
import { schematicGeometry } from './schematic-pin-layout.mjs';
import { schematicObstacle } from './schematic-routing.mjs';
import { renderSchematicSymbol } from './schematic-symbols.mjs';

const labels={
  en:['Print current view…','Save as file…','Rotate 90° left','Rotate 90° right','Mirror horizontally','Mirror vertically','Reset orientation','Delete selection','Power & Ground','Passive','Diodes & LEDs','Transistors & ICs','Logic gates','Switches','Instruments','Click a component, then click the canvas. Escape cancels.','Wire','Transformation needs free space inside the canvas.'],
  de:['Aktuelle Ansicht drucken…','Als Datei speichern…','90° links drehen','90° rechts drehen','Horizontal spiegeln','Vertikal spiegeln','Ausrichtung zurücksetzen','Auswahl löschen','Strom & Masse','Passive Bauteile','Dioden & LEDs','Transistoren & ICs','Logikgatter','Schalter','Messgeräte','Bauteil wählen, dann auf den Zeichenbereich klicken. Escape bricht ab.','Leitung','Die Transformation benötigt freien Platz im Zeichenbereich.'],
  yo:['Tẹ àwòrán yìí jáde…','Fi pamọ́ sí fáìlì…','Yí 90° sí òsì','Yí 90° sí ọ̀tún','Ṣe àfihàn petele','Ṣe àfihàn inaro','Dá ìtọ́sọ́nà padà','Pa ohun tí a yàn rẹ́','Agbára àti ilẹ̀','Àwọn ẹ̀yà palolo','Dáíódù àti LED','Transistor àti IC','Ẹnu ọ̀nà ọgbọ́n','Yíyípadà','Ohun èlò ìwọ̀n','Yan ẹ̀yà, lẹ́yìn náà tẹ àwòrán. Escape fagilé.','Wáyà','Ìyípadà nílò ààyè òfo nínú àwòrán.'],
  pcm:['Print this view…','Save as file…','Turn 90° left','Turn 90° right','Mirror left to right','Mirror up to down','Reset direction','Delete selection','Power & Ground','Passive','Diodes & LEDs','Transistors & ICs','Logic gates','Switches','Instruments','Choose component, then click canvas. Escape go cancel.','Wire','This change need free space inside canvas.']
};
const keys=['print','saveAs','rotateLeft','rotateRight','mirrorX','mirrorY','resetOrientation','delete','power','passive','diodes','active','logic','switches','instruments','drawHint','wire','transformBlocked'];
export const editorMenuText=(locale,key)=>(labels[locale]??labels.en)[keys.indexOf(key)]??key;
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function drawGroups(){
  const groups=new Map(['power','passive','diodes','active','logic','switches','instruments'].map(key=>[key,[]]));
  for(const part of STARTER_LIBRARY){
    // Offer native terminal-aware symbols, never a generic fallback box or a new part claim.
    if(!part.views?.schematic||(!SCHEMATIC_PRIMITIVES[part.id]&&part.id!=='active.stm32-timer-ideal'))continue;
    const key=/^(power|ground)\./.test(part.id)?'power':part.id.startsWith('passive.')?'passive':part.id.startsWith('diode.')?'diodes':part.id.startsWith('active.logic-')?'logic':part.id.startsWith('input.')?'switches':part.id.startsWith('instrument.')?'instruments':'active';
    groups.get(key).push(part);
  }
  return [...groups].filter(([,parts])=>parts.length).map(([key,parts])=>({key,parts}));
}
export function drawMenuMarkup(locale){
  return `<p class="draw-hint">${escape(editorMenuText(locale,'drawHint'))}</p><button type="button" data-action="schematic-wire-mode">⌁ ${escape(editorMenuText(locale,'wire'))}</button><div class="draw-groups">${drawGroups().map(({key,parts},i)=>`<details class="draw-category" ${i===0?'open':''}><summary>${escape(editorMenuText(locale,key))}</summary><div class="draw-parts">${parts.map(part=>`<button type="button" data-draw-part="${escape(part.id)}" title="${escape(part.status??part.type)}"><span aria-hidden="true">${renderSchematicSymbol(part)}</span><span>${escape(part.type)}</span></button>`).join('')}</div></details>`).join('')}</div>`;
}
export function attachDrawMenu(menu,onChoose){
  const open=group=>menu.querySelectorAll('.draw-category').forEach(other=>{other.open=other===group;});
  const click=event=>{
    const summary=event.target.closest?.('.draw-category > summary');
    if(summary){event.preventDefault();open(summary.parentElement);return;}
    const part=event.target.closest?.('[data-draw-part]');
    if(part){menu.open=false;onChoose(part.dataset.drawPart);}
  };
  const hover=event=>{const group=event.target.closest?.('.draw-category');if(group&&event.pointerType==='mouse')open(group);};
  menu.addEventListener('click',click);menu.addEventListener('pointerover',hover);
  return ()=>{menu.removeEventListener('click',click);menu.removeEventListener('pointerover',hover);};
}

export function transformSchematicComponent(project,id,action){
  const component=project.components.find(c=>c.instanceId===id);
  if(!component)throw new Error('Select a schematic component first.');
  const geometry={...schematicGeometry(component)};
  if(action==='rotateLeft'||action==='rotateRight')geometry.rotation=(geometry.rotation+(action==='rotateLeft'?270:90))%360;
  else if(action==='mirrorX'||action==='mirrorY'){
    // Reflect in canvas axes: M R(theta) = R(-theta) M. Pins use this same transform.
    geometry.rotation=(360-geometry.rotation)%360;
    if(geometry[action])delete geometry[action];else geometry[action]=true;
  }else if(action==='resetOrientation'){geometry.rotation=0;delete geometry.mirrorX;delete geometry.mirrorY;}
  else throw new Error('Unknown transformation.');
  const next={...component,geometry:{...component.geometry,schematic:geometry}},box=schematicObstacle(next);
  const collision=project.components.some(c=>{if(c.instanceId===id)return false;const b=schematicObstacle(c);return box.left<b.right&&box.right>b.left&&box.top<b.bottom&&box.bottom>b.top;});
  if(box.left<0||box.right>680||box.top<0||box.bottom>300||collision)throw new Error('TRANSFORM_SPACE');
  return updateComponent(project,id,{geometry:next.geometry});
}

export function printProjectView({document,window,project,view,viewLabel}){
  const scene=document.querySelector('#design-canvas .canvas-scene');if(!scene)return;
  document.querySelector('#project-print')?.remove();
  const sheet=document.createElement('section');sheet.id='project-print';
  const heading=document.createElement('h1');heading.textContent=project.metadata.name;
  const caption=document.createElement('p');caption.textContent=`AdigunSimulator · HB Elektroniker · ${viewLabel}`;
  const drawing=document.createElement('div');drawing.className=`print-canvas ${view}`;
  const clone=scene.cloneNode(true);clone.style.transform='none';
  clone.querySelectorAll('.placement-ghost,.component-selection,.wire-waypoint,.junction-candidate').forEach(node=>node.remove());
  drawing.append(clone);sheet.append(heading,caption,drawing);document.body.append(sheet);
  const cleanup=()=>sheet.remove();window.addEventListener('afterprint',cleanup,{once:true});
  try{window.print();}catch(error){window.removeEventListener('afterprint',cleanup);cleanup();throw error;}
}
