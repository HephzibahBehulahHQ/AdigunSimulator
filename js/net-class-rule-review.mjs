import { readPcbNetClasses } from "./pcb-net-classes.mjs";
import { minimumPcbTraceWidth } from "./pcb-board.mjs";
const csv=(v)=>'"'+String(v??"").replaceAll('"','""')+'"';
const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],den=dx*dx+dy*dy,t=den?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/den)):0;return Math.hypot(p[0]-(a[0]+t*dx),p[1]-(a[1]+t*dy));};
const orient=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function segmentDistance(a,b,c,d){const o1=orient(a,b,c),o2=orient(a,b,d),o3=orient(c,d,a),o4=orient(c,d,b),on=(p,q,r)=>Math.abs(orient(p,q,r))<1e-9&&r[0]>=Math.min(p[0],q[0])-1e-9&&r[0]<=Math.max(p[0],q[0])+1e-9&&r[1]>=Math.min(p[1],q[1])-1e-9&&r[1]<=Math.max(p[1],q[1])+1e-9;const intersects=(o1*o2<0&&o3*o4<0)||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b);if(intersects)return 0;return Math.min(distance(a,c,d),distance(b,c,d),distance(c,a,b),distance(d,a,b));}
const q=(n)=>Number(n.toFixed(3));
export function reviewNetClassRules(project) {
  const pcb=project?.pcbFabrication, policy=readPcbNetClasses(pcb,new Set((project?.nets??[]).map(net=>net.id)));
  const errors=[...policy.errors], rows=[["Check","Subject","Measured_mm","Required_mm","Status"]];
  const result=()=>({status:errors.length?"failed":"passed",errors,rows,report:rows.map(row=>row.map(csv).join(",")).join("\r\n")+"\r\n"});
  const routes=pcb?.routes;
  if (!pcb?.board || !Array.isArray(routes) || routes.some(route=>!route || typeof route.netId!=="string" || !Number.isFinite(route.widthMm) || route.widthMm<=0 || !Array.isArray(route.pointsMm) || route.pointsMm.length<2 || route.pointsMm.some(point=>!Array.isArray(point)||point.length!==2||!point.every(Number.isFinite)))) { errors.push("Valid board and route geometry are required for net-class review."); return result(); }
  const segments=routes.reduce((sum,route)=>sum+route.pointsMm.length-1,0);
  if (policy.errors.length) return result();
  if (segments*segments*Math.max(1,policy.rules.length)>2000000) { errors.push("Net-class review exceeds its bounded pair-work limit."); return result(); }
  const members=net=>policy.classes.filter(item=>item.netIds.includes(net));
  for(const route of [...routes].sort((a,b)=>a.netId.localeCompare(b.netId))) {
    const required=minimumPcbTraceWidth(pcb,route.netId), pass=Number.isFinite(required)&&route.widthMm+1e-9>=required;
    rows.push(["route-width",route.netId+" ("+(members(route.netId).map(item=>item.name).join(" + ")||"Board default")+")",q(route.widthMm),q(required),pass?"PASS":"FAIL"]);
    if(!pass) errors.push("Route "+route.netId+" is below its board/net-class width floor.");
  }
  for(const rule of policy.rules) {
    let measured=Infinity;
    for(let i=0;i<routes.length;i++) for(let j=i+1;j<routes.length;j++) {
      const a=routes[i],b=routes[j]; if(a.layer!==b.layer||a.netId===b.netId)continue;
      const aa=members(a.netId).map(item=>item.id),bb=members(b.netId).map(item=>item.id);
      if(!((aa.includes(rule.classA)&&bb.includes(rule.classB))||(aa.includes(rule.classB)&&bb.includes(rule.classA))))continue;
      for(let x=1;x<a.pointsMm.length;x++)for(let y=1;y<b.pointsMm.length;y++) measured=Math.min(measured,segmentDistance(a.pointsMm[x-1],a.pointsMm[x],b.pointsMm[y-1],b.pointsMm[y])-(a.widthMm+b.widthMm)/2);
    }
    const required=Math.max(pcb.board.minimumClearanceMm,rule.minimumClearanceMm,...policy.classes.filter(item=>[rule.classA,rule.classB].includes(item.id)).map(item=>item.minimumClearanceMm??0));
    const pass=measured+1e-9>=required;
    rows.push(["class-clearance",rule.classA+"/"+rule.classB,Number.isFinite(measured)?q(measured):"n/a",q(required),pass?"PASS":"FAIL"]);
    if(!pass)errors.push("Route clearance between "+rule.classA+" and "+rule.classB+" is below the board/class rule.");
  }
  return result();
}
