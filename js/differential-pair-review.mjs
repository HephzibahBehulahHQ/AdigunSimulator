const connected=(project,net,endpoint)=>Boolean(project.nets.find((x)=>x.id===net)?.endpoints.includes(endpoint));
export function reviewDifferentialPair(project){
 const checks=[],add=(id,ok,detail)=>checks.push({id,status:ok?"pass":"fail",detail});
 const pcb=project?.pcbFabrication,pair=pcb?.differentialPairs?.[0],rule=pcb?.pairRules?.find((x)=>x.id===pair?.pairId);
 if(!pair||!rule)return {status:"failed",checks:[{id:"pair-rule-missing",status:"fail",detail:"Differential pair rule is missing."}]};
 const pairCount=(pcb.differentialPairs??[]).length;
 add("usb-dp-dm-mapping",pairCount===1&&pair.positiveNet==="USB_DP"&&pair.negativeNet==="USB_DM"&&connected(project,"USB_DP","usb:A6")&&connected(project,"USB_DP","usb:B6")&&connected(project,"USB_DP","phy:D+")&&connected(project,"USB_DM","usb:A7")&&connected(project,"USB_DM","usb:B7")&&connected(project,"USB_DM","phy:D-"),"USB-C D+/D− contacts map to the matching TUSB1106 transceiver pins.");
 add("pair-rule-width-gap",pair.widthMm>=rule.minWidthMm&&pair.widthMm<=rule.maxWidthMm&&pair.gapMm>=rule.minGapMm&&pair.gapMm<=rule.maxGapMm,"Declared pair width and spacing fall within the example rule ranges.");
 const skew=Math.abs(pair.positiveLengthMm-pair.negativeLengthMm);
 add("pair-length-skew",skew<=Math.min(rule.maxSkewMm,pair.maxSkewMm),"Declared positive/negative lengths meet the allowed pair skew.");
 add("same-layer-reference",pair.layer==="F.Cu"&&pair.referencePlane==="In1.Cu"&&pcb.stackup?.find((x)=>x.layer==="In1.Cu")?.primaryNet==="GND"&&pcb.stackup?.find((x)=>x.layer==="In1.Cu")?.role==="Continuous ground reference","Pair is assigned to one signal layer above the declared continuous GND reference.");
 add("target-impedance-disclosure",pair.targetDifferentialImpedanceOhms===90&&pair.impedanceVerified===false,"90 Ω is a declared design target; no impedance calculation is claimed.");
 return {status:checks.every((x)=>x.status==="pass")?"passed":"failed",checks,skewMm:skew,disclaimer:"This report verifies declared width, gap, layer, reference and length-match metadata only. It does not run a field solver, measure copper length, verify 90 Ω impedance, or test USB eye, jitter, protocol, EMC or fabrication performance."};
}
export function createDifferentialPairReport(project){
 const r=reviewDifferentialPair(project),rows=[["Check","Status","Detail"],...r.checks.map((x)=>[x.id,x.status,x.detail]),["Measured skew (declared mm)",String(r.skewMm),"Calculated from the declared positive/negative trace-length inputs."],["Scope","informational",r.disclaimer]];
 return rows.map((row)=>row.map((x)=>'"'+String(x).replaceAll('"','""')+'"').join(",")).join("\r\n")+"\r\n";
}
