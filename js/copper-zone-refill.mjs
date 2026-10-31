const csv=v=>'"'+String(v??"").replaceAll('"','""')+'"';
const dist=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/d)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
export function refillCopperZone(project){
  const pcb=project?.pcbFabrication,zone=pcb?.copperZones?.[0],board=pcb?.board,parts=pcb?.pads??[],routes=pcb?.routes??[];
  const rows=[["Zone","Net","Clearance_mm","Grid_pitch_mm","Filled_cells","Estimated_area_mm2","Connected_pad_candidates","Thermal_relief_pads","Status"]],errors=[];
  const fail=(message)=>({status:"failed",errors:[message],filledCells:0,estimatedAreaMm2:0,connectedPadCandidates:[],report:rows.map(r=>r.map(csv).join(",")).join("\r\n")+"\r\n"});
  if(!zone||!board)return fail("A declared copper zone and board are required.");
  const rect=zone.bounds,pitch=zone.gridPitchMm,clearance=zone.clearanceMm;
  if(!rect||![rect.xMm,rect.yMm,rect.widthMm,rect.heightMm,pitch,clearance].every(Number.isFinite)||rect.widthMm<=0||rect.heightMm<=0||pitch<=0||clearance<board.minimumClearanceMm)return fail("Zone bounds, grid pitch and clearance must be valid and meet the board minimum.");
  if(rect.xMm<0||rect.yMm<0||rect.xMm+rect.widthMm>board.widthMm||rect.yMm+rect.heightMm>board.heightMm)return fail("Copper zone bounds must stay inside the board.");
  const same=parts.filter(p=>p.netId===zone.netId&&p.xMm>=rect.xMm&&p.xMm<=rect.xMm+rect.widthMm&&p.yMm>=rect.yMm&&p.yMm<=rect.yMm+rect.heightMm);
  if(!same.length)return fail("Copper zone has no in-bounds pad on its assigned net.");
  const foreignPads=parts.filter(p=>p.netId!==zone.netId),foreignRoutes=routes.filter(r=>r.netId!==zone.netId&&r.layer===zone.layer);
  const nx=Math.ceil(rect.widthMm/pitch),ny=Math.ceil(rect.heightMm/pitch);let filled=0;
  for(let ix=0;ix<nx;ix++)for(let iy=0;iy<ny;iy++){
    const x=rect.xMm+(ix+.5)*pitch,y=rect.yMm+(iy+.5)*pitch;
    let blocked=false;
    for(const pad of foreignPads){const hw=(pad.widthMm??pad.diameterMm??0)/2,hh=(pad.heightMm??pad.diameterMm??0)/2;if(Math.abs(x-pad.xMm)<=hw+clearance&&Math.abs(y-pad.yMm)<=hh+clearance){blocked=true;break;}}
    if(!blocked)for(const route of foreignRoutes){for(let i=1;i<route.pointsMm.length;i++)if(dist([x,y],route.pointsMm[i-1],route.pointsMm[i])<=clearance+route.widthMm/2){blocked=true;break;}if(blocked)break;}
    if(!blocked)filled++;
  }
  const thermal=(zone.thermalRelief?.spokes===4&&zone.thermalRelief?.spokeWidthMm>0)?same.filter(p=>p.technology==="through-hole").length:0;
  if(!thermal)errors.push("No eligible in-zone through-hole pad has the declared four-spoke thermal-relief proposal.");
  const area=Number((filled*pitch*pitch).toFixed(3)),excluded=nx*ny-filled;
  rows.push([zone.id,zone.netId,clearance,pitch,filled,area,same.length,thermal,errors.length?"FAIL":"PASS"]);
  return {status:errors.length?"failed":"passed",errors,filledCells:filled,estimatedAreaMm2:area,gridCells:nx*ny,excludedCells:excluded,connectedPadCandidates:same.map(p=>p.reference+":"+p.pin).sort(),thermalReliefPadCandidates:same.filter(p=>p.technology==="through-hole").map(p=>p.reference+":"+p.pin).sort(),report:rows.map(r=>r.map(csv).join(",")).join("\r\n")+"\r\n",limitations:["Rectangular educational grid refill preview; cell count is an area estimate.","Thermal relief is declared intent only; spoke geometry and electrical connectivity are not solved.","No production copper-zone refill, island analysis, Gerber zone export, or manufacturing DRC."]};
}
