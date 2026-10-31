import { exportPcbFabrication } from "./pcb-export.mjs";
import { createPcbPlacementReport } from "./pcb-placement-report.mjs";
import { createAssemblyVariantBoms } from "./assembly-variant-bom.mjs";
import { reviewNetClassRules } from "./net-class-rule-review.mjs";
import { refillCopperZone } from "./copper-zone-refill.mjs";
import { reviewPcbSchematicReconciliation } from "./pcb-schematic-reconciliation.mjs";

const encoder = new TextEncoder();
const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
const rotr=(x,n)=>(x>>>n)|(x<<(32-n));
function sha256(text){
  const input=encoder.encode(text), bitLength=input.length*8, paddedLength=Math.ceil((input.length+9)/64)*64;
  const bytes=new Uint8Array(paddedLength);bytes.set(input);bytes[input.length]=0x80;
  const view=new DataView(bytes.buffer);view.setUint32(paddedLength-8,Math.floor(bitLength/0x100000000));view.setUint32(paddedLength-4,bitLength>>>0);
  const h=[0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19],w=new Uint32Array(64);
  for(let off=0;off<paddedLength;off+=64){
    for(let i=0;i<16;i++)w[i]=view.getUint32(off+i*4);
    for(let i=16;i<64;i++){const a=w[i-15],b=w[i-2],s0=rotr(a,7)^rotr(a,18)^(a>>>3),s1=rotr(b,17)^rotr(b,19)^(b>>>10);w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0;}
    let a=h[0],b=h[1],c=h[2],d=h[3],e=h[4],f=h[5],g=h[6],z=h[7];
    for(let i=0;i<64;i++){const s1=rotr(e,6)^rotr(e,11)^rotr(e,25),ch=(e&f)^(~e&g),t1=(z+s1+ch+K[i]+w[i])>>>0,s0=rotr(a,2)^rotr(a,13)^rotr(a,22),maj=(a&b)^(a&c)^(b&c),t2=(s0+maj)>>>0;z=g;g=f;f=e;e=(d+t1)>>>0;d=c;c=b;b=a;a=(t1+t2)>>>0;}
    h[0]=(h[0]+a)>>>0;h[1]=(h[1]+b)>>>0;h[2]=(h[2]+c)>>>0;h[3]=(h[3]+d)>>>0;h[4]=(h[4]+e)>>>0;h[5]=(h[5]+f)>>>0;h[6]=(h[6]+g)>>>0;h[7]=(h[7]+z)>>>0;
  }
  return h.map(n=>n.toString(16).padStart(8,"0")).join("");
}
function pdfText(value){return String(value).replace(/[^\x20-\x7e]/g,"?").replaceAll("\\","\\\\").replaceAll("(","\\(").replaceAll(")","\\)");}
function createOverviewPdf(project){
  const pcb=project.pcbFabrication, items=(pcb.parts??[]).slice().sort((a,b)=>a.reference.localeCompare(b.reference));
  const lines=["ADIGUNSIMULATOR - EDUCATIONAL EXPORT OVERVIEW","Project: "+project.metadata.name,"Board: "+pcb.board.widthMm+" x "+pcb.board.heightMm+" mm; "+pcb.board.copperLayers.length+" copper layer(s)","Thickness: "+(pcb.board.thicknessMm??"not specified")+" mm","", "PLACEMENT (mm)"];
  for(const part of items){const pads=pcb.pads.filter(p=>p.instanceId===part.instanceId);const x=pads.reduce((s,p)=>s+p.xMm,0)/pads.length;const y=pads.reduce((s,p)=>s+p.yMm,0)/pads.length;const comp=project.components.find(c=>c.instanceId===part.instanceId);lines.push(part.reference+" | "+(comp?.value??"")+" | "+part.footprint+" | X "+x.toFixed(3)+" Y "+y.toFixed(3));}
  lines.push("","Generated files are bounded educational exports. Review all data before use.","No fabrication, assembly, safety or regulatory approval is implied.");
  const commands=["BT","/F1 10 Tf","48 752 Td","14 TL"];
  for(let i=0;i<lines.length;i++){if(i)commands.push("T*");commands.push("("+pdfText(lines[i])+") Tj");}
  commands.push("ET");
  const stream=commands.join("\n");
  const objects=["<< /Type /Catalog /Pages 2 0 R >>","<< /Type /Pages /Kids [3 0 R] /Count 1 >>","<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>","<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>","<< /Length "+stream.length+" >>\nstream\n"+stream+"\nendstream"];
  let pdf="%PDF-1.4\n", offsets=[0];
  objects.forEach((obj,i)=>{offsets.push(pdf.length);pdf+=(i+1)+" 0 obj\n"+obj+"\nendobj\n";});
  const xref=pdf.length;pdf+="xref\n0 "+(objects.length+1)+"\n0000000000 65535 f \n";
  for(let i=1;i<offsets.length;i++)pdf+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
  pdf+="trailer\n<< /Size "+(objects.length+1)+" /Root 1 0 R >>\nstartxref\n"+xref+"\n%%EOF\n";
  return pdf;
}
export function createManufacturingExportPack(project){
  const fabrication=exportPcbFabrication(project);
  if(fabrication.status!=="passed")return {status:"blocked",errors:fabrication.drc?.errors??["PCB fabrication checks did not pass."],drc:fabrication.drc,files:{},checksums:{}};
  const files={...fabrication.files,"Placement.csv":createPcbPlacementReport(project),"Assembly-Overview.pdf":createOverviewPdf(project)};
  const variantBoms=createAssemblyVariantBoms(project);
  if(variantBoms.status!=="passed")return {status:"blocked",errors:variantBoms.errors,drc:fabrication.drc,files:{},checksums:{}};
  Object.assign(files,variantBoms.files);
  if(project.pcbFabrication?.netClasses){const netClassReview=reviewNetClassRules(project);if(netClassReview.status!=="passed")return {status:"blocked",errors:netClassReview.errors,drc:fabrication.drc,files:{},checksums:{}};files["Net-Class-Rule-Report.csv"]=netClassReview.report;}
  if(project.pcbFabrication?.copperZones){const zoneReview=refillCopperZone(project);if(zoneReview.status!=="passed")return {status:"blocked",errors:zoneReview.errors,drc:fabrication.drc,files:{},checksums:{}};files["Copper-Zone-Review.csv"]=zoneReview.report;}
  if(project.pcbFabrication?.reconciliationChanges){const reconciliation=reviewPcbSchematicReconciliation(project);if(reconciliation.status!=="choice-recorded")return {status:"blocked",errors:reconciliation.errors,drc:fabrication.drc,reconciliation,files:{},checksums:{}};files["Pcb-Schematic-Reconciliation.csv"]=reconciliation.report;}
  const fileHashes={};
  for(const name of Object.keys(files).sort())fileHashes[name]=sha256(files[name]);
  const pcb=project.pcbFabrication;
  const manifest={format:"AdigunSimulator educational manufacturing export pack",schemaVersion:1,projectId:project.id,projectName:project.metadata.name,board:{widthMm:pcb.board.widthMm,heightMm:pcb.board.heightMm,thicknessMm:pcb.board.thicknessMm,copperLayers:pcb.board.copperLayers},checks:fileHashes,limitations:["Bounded single-copper-layer educational export only.","Not a general Gerber/Excellon implementation or fabrication approval.","Footprints, stackup, drill data, placement, assembly, DRC and manufacturing rules require independent review."]};
  files["Export-Manifest.json"]=JSON.stringify(manifest,null,2)+"\n";
  fileHashes["Export-Manifest.json"]=sha256(files["Export-Manifest.json"]);
  files["SHA256SUMS.txt"]=Object.keys(fileHashes).sort().map(name=>fileHashes[name]+"  "+name).join("\n")+"\n";
  return {status:"passed",drc:fabrication.drc,files,checksums:fileHashes};
}
