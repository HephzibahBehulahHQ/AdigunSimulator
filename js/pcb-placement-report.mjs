const q=(v)=>`"${String(v).replaceAll('"','""')}"`;
export function createPcbPlacementReport(project){
  const rows=[["Designator","Value","Footprint","Technology","X_mm","Y_mm","Rotation_deg"]];
  const components=new Map((project?.components??[]).map((item)=>[item.instanceId,item]));
  for(const part of [...(project?.pcbFabrication?.parts??[])].sort((a,b)=>a.reference.localeCompare(b.reference))){
    const pads=(project.pcbFabrication.pads??[]).filter((pad)=>pad.instanceId===part.instanceId);
    if(!pads.length)continue;
    const x=pads.reduce((sum,pad)=>sum+pad.xMm,0)/pads.length;
    const y=pads.reduce((sum,pad)=>sum+pad.yMm,0)/pads.length;
    const component=components.get(part.instanceId);
    rows.push([part.reference,component?.value??"",part.footprint,part.technology,x.toFixed(3),y.toFixed(3),"0"]);
  }
  return rows.map((row)=>row.map(q).join(",")).join("\r\n")+"\r\n";
}
