import { getPcbPreviewScale } from "./pcb-preview.mjs";
const clone=value=>JSON.parse(JSON.stringify(value));
const close=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1])<=.001;
export function movePcbFootprint(project,instanceId,deltaMm){
 const pcb=project?.pcbFabrication,board=pcb?.board;
 if(!pcb||!board||!Array.isArray(pcb.parts)||!Array.isArray(pcb.pads)||!Array.isArray(pcb.routes))return{status:"blocked",code:"NO_PCB_DATA"};
 if(!Number.isFinite(board.widthMm)||!Number.isFinite(board.heightMm)||board.widthMm<=0||board.heightMm<=0)return{status:"blocked",code:"INVALID_FOOTPRINT_GEOMETRY"};
 if(!pcb.parts.some(p=>p.instanceId===instanceId))return{status:"blocked",code:"UNKNOWN_FOOTPRINT"};
 const pads=pcb.pads.filter(p=>p.instanceId===instanceId);if(!pads.length)return{status:"blocked",code:"NO_FOOTPRINT_PADS"};
 const dx=Number(deltaMm?.x),dy=Number(deltaMm?.y);if(!Number.isFinite(dx)||!Number.isFinite(dy))return{status:"blocked",code:"INVALID_DELTA"};if(Math.hypot(dx,dy)<.0001)return{status:"unchanged",project};
 const bounds=pads.map(p=>{const x=Number(p.xMm),y=Number(p.yMm),w=p.technology==="through-hole"?Number(p.diameterMm):Number(p.widthMm),h=p.technology==="through-hole"?Number(p.diameterMm):Number(p.heightMm);if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)return null;return{x:x+dx,y:y+dy,rx:w/2,ry:h/2};});
 if(bounds.some(p=>!p))return{status:"blocked",code:"INVALID_FOOTPRINT_GEOMETRY"};
 if(bounds.some(p=>p.x-p.rx<0||p.y-p.ry<0||p.x+p.rx>board.widthMm||p.y+p.ry>board.heightMm))return{status:"blocked",code:"OUT_OF_BOUNDS"};
 const byNet=new Map();for(const p of pads){const a=byNet.get(p.netId)??[];a.push([p.xMm,p.yMm]);byNet.set(p.netId,a);}
 const next=clone(project);let updatedRoutePoints=0;
 next.pcbFabrication.pads=next.pcbFabrication.pads.map(p=>p.instanceId===instanceId?{...p,xMm:p.xMm+dx,yMm:p.yMm+dy}:p);
 next.pcbFabrication.routes=next.pcbFabrication.routes.map(route=>{const anchors=byNet.get(route.netId)??[];if(!anchors.length)return route;let changed=false;const pointsMm=(route.pointsMm??[]).map(pt=>{if(!Array.isArray(pt)||pt.length!==2||!anchors.some(a=>close(a,pt)))return pt;changed=true;updatedRoutePoints++;return[pt[0]+dx,pt[1]+dy];});return changed?{...route,pointsMm}:route;});
 const scale=getPcbPreviewScale(board),i=next.components.findIndex(c=>c.instanceId===instanceId);if(i>=0&&scale){const c=next.components[i],[x=120,y=120]=c.position?.pcb??[];next.components[i]={...c,position:{...c.position,pcb:[x+dx*scale,y+dy*scale]}};}
 if(next.metadata)next.metadata={...next.metadata,updatedAt:new Date().toISOString()};return{status:"complete",project:next,movedPadCount:pads.length,updatedRoutePoints};
}

