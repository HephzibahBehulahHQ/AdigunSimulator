import { canvasClientPoint } from "./canvas-camera.mjs";
import { resolveSchematicWires,storeSchematicWire,finishSchematicWire,resumeSchematicWire,joinDanglingWire,editWireRoute,nearestWireSegment,splitSchematicWire,removeSchematicWire,snapWirePoint,wirePinPoint } from "./schematic-wires.mjs";
import { wireEdgeKey } from "./dc-wire-feedback.mjs";
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const path=points=>points.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ');
const labels={
 en:['Wire','Pause wire','Cancel drawing','Resume','Split wire','Delete wire','Waypoints','From','To','Open endpoint','Drawing coordinates (not mm)','Click empty canvas for bends; choose a pin to finish. Escape/right-click pauses.','Double-click a segment to add a point; drag or use arrow keys; Alt-click/Delete removes a point.','Add waypoint','Crossing preview limit reached; some bridges are omitted. Electrical connectivity is unchanged.'],
 de:['Leitung','Leitung pausieren','Zeichnen abbrechen','Fortsetzen','Leitung trennen','Leitung löschen','Stützpunkte','Von','Nach','Offenes Ende','Zeichenkoordinaten (keine mm)','Knickpunkte auf freier Fläche setzen; an einem Pin beenden. Escape/Rechtsklick pausiert.','Doppelklick fügt einen Punkt hinzu; ziehen oder Pfeiltasten; Alt-Klick/Entf entfernt ihn.','Punkt hinzufügen','Grenze der Kreuzungsvorschau erreicht; einige Brücken fehlen. Die Netzverbindungen bleiben unverändert.'],
 yo:['Wáyà','Dá wáyà dúró díẹ̀','Fagilé yíya','Tẹ̀síwájú','Pín wáyà','Pa wáyà rẹ́','Àwọn ibi ìyí','Láti','Sí','Òpin tí ó ṣí','Iye àwòrán (kì í ṣe mm)','Tẹ ibi òfo fún ìyí; yan pin láti parí. Escape/títẹ ọ̀tún dá a dúró díẹ̀.','Tẹ ẹ̀ẹ̀mejì láti fi ibi kun; fà tàbí lo ọfà; Alt-títẹ/Delete yọ ibi kúrò.','Fi ibi ìyí kun','Ààlà àfihàn ìkọjá ti dé; díẹ̀ kò hàn. Àwọn àsopọ̀ kò yí padà.'],
 pcm:['Wire','Pause wire','Cancel drawing','Continue','Split wire','Delete wire','Bend points','From','To','Open end','Drawing coordinates (no be mm)','Click empty space for bends; choose pin to finish. Escape/right-click go pause.','Double-click segment add point; drag or use arrow keys; Alt-click/Delete remove point.','Add bend point','Crossing preview don reach limit; some bridges no show. Electrical connections no change.']
};
export function createSchematicWireUi({getState,canvas,panel,snap,commit,render,showInspector,getFeedback,onError,crossingNotice}){
 let draft=null,cursor=null,drag=null,fieldSession=null,cacheProject=null,cacheKey='',cached=[],limited=false;
 const state=()=>getState(),text=i=>(labels[state().project.metadata.locale]??labels.en)[i];
 const point=e=>snapWirePoint(canvasClientPoint({x:e.clientX,y:e.clientY},canvas.querySelector('.canvas-scene').getBoundingClientRect()),snap());
 function routes(project=state().project,unavailable) {if(unavailable===undefined&&cacheProject===project)return cached;unavailable??=new Set();const key=[...unavailable].sort().join('|');if(cacheProject!==project||cacheKey!==key){cached=resolveSchematicWires(project,unavailable);cacheProject=project;cacheKey=key;}return cached;}
 function selectedRoute(){const s=state().selectedWire;if(!s)return null;return routes().find(r=>s.wireId?r.wireId===s.wireId:r.netId===s.netId&&r.first===s.first&&r.second===s.second)??null;}
 function clear(){draft=null;cursor=null;state().schematicWireStart=null;state().schematicWireMode=false;}
 function select(route){state().selectedWire={netId:route.netId,first:route.first,second:route.second,wireId:route.wireId};state().selectedInstanceId=null;state().selectedNetId=route.netId;showInspector();}
 function apply(next,before=state().project){commit(next,before);render();}
 function begin(endpoint){draft={from:endpoint,waypoints:[],netHint:state().project.nets.find(n=>n.endpoints.includes(endpoint))?.id};cursor=null;state().schematicWireStart=endpoint;state().schematicWireMode=true;state().selectedWire=null;showInspector();render();}
 function pause(){if(!draft){clear();render();return;}const points=draft.waypoints.slice(),end=cursor??points.at(-1);if(end&&points.length&&points.at(-1).every((n,i)=>n===end[i]))points.pop();if(!end){clear();render();return;}
   const next=storeSchematicWire(state().project,{...draft,end,waypoints:points}),wire=next.schematicWires.find(w=>w.id===draft.id)||next.schematicWires.at(-1);
   clear();state().selectedWire={wireId:wire.id};showInspector();apply(next);
 }
 function cancel(){clear();render();}
 function resume(id){const w=state().project.schematicWires?.find(w=>w.id===id);if(!w||w.to!==null)return;draft=resumeSchematicWire(w);cursor=[...w.end];state().schematicWireStart=w.from;state().schematicWireMode=true;state().selectedWire={wireId:id};showInspector();render();}
 function toggle(){if(state().schematicWireMode)pause();else{clear();state().schematicWireMode=true;showInspector();render();}}
 function edit(route,points){const next=editWireRoute(state().project,route,points);state().selectedWire={...state().selectedWire,wireId:next.schematicWires.find(w=>w.from===route.first&&w.to===route.second)?.id};apply(next);}
 function insert(route,p){if(route.points.length>=514){onError('A wire can contain at most 512 waypoints.');return;}const hit=nearestWireSegment(route.points,p);if(!hit)return;const points=route.points.slice(1,-1);points.splice(hit.index,0,snapWirePoint(p,snap()));edit(route,points);}
 function action(name){const route=selectedRoute();try{
   if(name==='pause')pause();if(name==='cancel')cancel();if(name==='resume')resume(route?.wireId);
   if(name==='delete'&&route){const next=removeSchematicWire(state().project,route);state().selectedWire=null;apply(next);}
   if(name==='split'&&route){const next=splitSchematicWire(state().project,route);state().selectedWire={wireId:next.schematicWires.at(-2).id};apply(next);}
   if(name==='add'&&route){const a=route.points[0],b=route.points[1];insert(route,[(a[0]+b[0])/2,(a[1]+b[1])/2]);}
 }catch(e){onError(e.message);}}
 function click(event){fieldSession=null;if(state().activeView!=='schematic')return false;const target=event.target;
   const command=target.closest('[data-wire-command]');if(command){action(command.dataset.wireCommand);return true;}
   const handle=target.closest('[data-wire-waypoint]');if(handle){if(event.altKey){const r=selectedRoute(),points=r.points.slice(1,-1);points.splice(Number(handle.dataset.wireWaypoint),1);edit(r,points);}return true;}
   const end=target.closest('[data-open-wire]');if(end){try{if(draft){const next=joinDanglingWire(state().project,draft,end.dataset.openWire);clear();state().selectedWire=null;apply(next);}else resume(end.dataset.openWire);}catch(e){onError(e.message);}return true;}
   const pin=target.closest('[data-schematic-endpoint]');if(pin&&target.closest('#design-canvas')&&state().activeTool==='select'){
     if(!draft){begin(pin.dataset.schematicEndpoint);return true;}if(draft.from===pin.dataset.schematicEndpoint){cancel();return true;}
     try{const next=finishSchematicWire(state().project,draft,pin.dataset.schematicEndpoint);clear();state().selectedWire=null;apply(next);}catch(e){onError(e.message);}return true;
   }
   const hit=target.closest('[data-wire-net], [data-wire-id]');
   if(hit&&target.closest('#design-canvas')&&!state().schematicWireMode&&state().activeTool==='select'){
     const route=routes().find(r=>hit.dataset.wireId?r.wireId===hit.dataset.wireId:r.netId===hit.dataset.wireNet&&r.first===hit.dataset.wireFirst&&r.second===hit.dataset.wireSecond);
     if(route){const same=selectedRoute()===route;select(route);if(event.detail===2)insert(route,point(event));else if(!same)render();return true;}
   }
   if(draft&&target.closest('#design-canvas')&&!target.closest('[data-instance-id]')){if(draft.waypoints.length>=512){onError('A wire can contain at most 512 waypoints.');return true;}cursor=point(event);draft.waypoints.push(cursor);render();return true;}
   return false;
 }
 function pointerDown(event){const h=event.target.closest('[data-wire-waypoint]'),route=selectedRoute();if(!h||!route||event.button!==0||event.altKey)return false;
   drag={pointerId:event.pointerId,index:Number(h.dataset.wireWaypoint),route,before:state().project,dirty:state().dirty};canvas.setPointerCapture?.(event.pointerId);event.preventDefault();return true;
 }
 function pointerMove(event){if(drag&&drag.pointerId===event.pointerId){const points=drag.route.points.slice(1,-1);points[drag.index]=point(event);state().project=editWireRoute(drag.before,drag.route,points);state().dirty=true;render();return true;}
   if(draft&&event.target.closest?.('#design-canvas')){cursor=point(event);render();return true;}return false;
 }
 function pointerEnd(event,cancelled=false){if(!drag||drag.pointerId!==event.pointerId)return false;const d=drag,next=state().project;drag=null;canvas.releasePointerCapture?.(event.pointerId);state().suppressCanvasClick=true;state().project=d.before;state().dirty=d.dirty;
   if(!cancelled&&next!==d.before)apply(next,d.before);else render();return true;
 }
 function keydown(event){if(event.key==='Escape'&&drag){event.preventDefault();pointerEnd({pointerId:drag.pointerId},true);return true;}
   if(event.key==='Escape'&&state().schematicWireMode){event.preventDefault();pause();return true;}
   if(event.target.closest?.('[data-wire-id]')&&['Enter',' '].includes(event.key)){event.preventDefault();return click({target:event.target,detail:1});}
   const h=event.target.closest?.('[data-wire-waypoint]'),route=selectedRoute();
   if(h&&route){const index=Number(h.dataset.wireWaypoint),points=route.points.slice(1,-1);if(['Delete','Backspace'].includes(event.key)){event.preventDefault();points.splice(index,1);edit(route,points);return true;}
     const vectors={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};if(vectors[event.key]){event.preventDefault();points[index]=points[index].map((n,i)=>n+vectors[event.key][i]*(snap()?12:1));edit(route,points);canvas.querySelector(`[data-wire-waypoint="${index}"]`)?.focus();return true;}
   }
   if(event.target.closest?.('[data-open-wire]')&&['Enter',' '].includes(event.key)){event.preventDefault();return click({target:event.target,detail:1});}
   return false;
 }
 function extraPaths(project,interactive,painter){if(draft&&!state().schematicWireMode)clear();let svg='';for(const r of routes(project).filter(r=>r.second===null)){const active=draft?.id===r.wireId,d=painter.path(r.points);svg+=`<path class="wire-hit" d="${d}" ${interactive?`data-wire-id="${escape(r.wireId)}" role="button" tabindex="0" aria-label="${escape(text(9)+' '+r.wireId)}"`:''}/><path class="dangling-wire${active?' is-draft':''}" d="${d}"/>`;}
   if(interactive&&draft){const origin=wirePinPoint(project,draft.from);if(origin)svg+=`<path class="wire-draft" d="${path([[origin.x,origin.y],...draft.waypoints,...(cursor?[cursor]:[])])}"/>`;}
   limited=painter.limited;return svg;
 }
 function handles(project,interactive){if(!interactive)return '';let svg='';for(const r of routes(project).filter(r=>r.second===null)){const p=r.points.at(-1);svg+=`<circle class="wire-open-end" cx="${p[0]}" cy="${p[1]}" r="5" data-open-wire="${escape(r.wireId)}" role="button" tabindex="0" aria-label="${escape(text(3)+' '+r.wireId)}"/>`;}
   if(!draft){const r=selectedRoute();if(r?.points)svg+=r.points.slice(1,-1).map((p,i)=>`<circle class="wire-waypoint" cx="${p[0]}" cy="${p[1]}" r="4" data-wire-waypoint="${i}" role="button" tabindex="0" aria-label="${escape(text(6))} ${i+1}"/>`).join('');}return svg;
 }
 function paintMeasurements(){const r=selectedRoute(),out=panel.querySelector('[data-wire-measurement]');if(!r||!out)return;const data=getFeedback(),m=data?.wires?.[wireEdgeKey(r.netId,r.first,r.second)],voltage=m?.voltageV??data?.nodes?.[r.netId],current=r.second===null?0:m?.currentA;out.textContent=`${r.netId??text(9)} · V=${Number.isFinite(voltage)?voltage.toPrecision(4):'—'} V · I=${Number.isFinite(current)?current.toPrecision(4):'—'} A`;}
 function renderPanel(){if(crossingNotice){crossingNotice.hidden=!limited;crossingNotice.textContent=limited?text(14):"";}const r=selectedRoute(),active=state().activeView==='schematic'&&(state().schematicWireMode||Boolean(r));panel.hidden=!active;if(!active)return;if(panel.querySelector('[data-wire-point]:focus')){paintMeasurements();return;}
   const commands=state().schematicWireMode?`<button type="button" data-wire-command="pause">${escape(text(1))}</button><button type="button" data-wire-command="cancel">${escape(text(2))}</button>`:'';
   const edits=r&&!draft?`<button type="button" data-wire-command="${r.second===null?'resume':'split'}">${escape(text(r.second===null?3:4))}</button><button type="button" data-wire-command="delete">${escape(text(5))}</button><button type="button" data-wire-command="add">${escape(text(13))}</button>`:'';
   const fields=r?r.points.slice(1,-1).map((p,i)=>{
     const inputs=p.map((v,axis)=>`<label>${axis?'Y':'X'}<input type="number" step="any" value="${v}" data-wire-point="${i}" data-axis="${axis}" aria-label="${escape(text(6))} ${i+1} ${axis?'Y':'X'}"/></label>`).join('');
     return `<div><span>${i+1}</span>${inputs}</div>`;
   }).join(''):'';
   const details=r?`<p>${escape(text(7))}: ${escape(r.first)}<br>${escape(text(8))}: ${escape(r.second??text(9))}</p><output data-wire-measurement></output><h4>${escape(text(6))}</h4><small>${escape(text(10))}</small><div class="wire-point-list">${fields}</div>`:'';
   panel.innerHTML=`<h3>${escape(text(0))}</h3>${limited?`<p role="alert">${escape(text(14))}</p>`:''}<p>${escape(text(draft||state().schematicWireMode?11:12))}</p><div class="wire-panel-actions">${commands}${edits}</div>${details}`;
   paintMeasurements();
 }
 function inputPoint(event){
   const input=event.target.closest('[data-wire-point]'),r=selectedRoute();if(!input||!r)return;
   const value=Number(input.value);if(!input.value.trim()||!Number.isFinite(value)||Math.abs(value)>100000){input.setCustomValidity?.('Enter a finite drawing coordinate between -100000 and 100000.');return;}
   input.setCustomValidity?.('');
   try{
     const points=r.points.slice(1,-1).map(p=>[...p]);points[Number(input.dataset.wirePoint)][Number(input.dataset.axis)]=value;
     const before=state().project,next=editWireRoute(before,r,points),key=[r.first,r.second,input.dataset.wirePoint,input.dataset.axis].join('|');
     state().selectedWire={...state().selectedWire,wireId:next.schematicWires.find(w=>w.from===r.first&&w.to===r.second)?.id};
     if(fieldSession?.key===key&&fieldSession.last===before){state().project=next;state().dirty=true;render();}else apply(next,before);
     fieldSession={key,last:next};
   }catch(e){onError(e.message);}
 }
 panel.addEventListener('input',inputPoint);
 panel.addEventListener('change',()=>{fieldSession=null;});
 panel.addEventListener('focusout',()=>{fieldSession=null;});
 return {routes,selectedRoute,click,pointerDown,pointerMove,pointerEnd,keydown,pause,cancel,toggle,extraPaths,handles,renderPanel,paintMeasurements,reset:()=>{clear();drag=null;fieldSession=null;},deleteSelected:()=>{if(!selectedRoute())return false;action('delete');return true;}};
}
